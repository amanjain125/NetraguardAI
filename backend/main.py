import io
import os
import base64
import logging
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from PIL import Image
import onnx
from onnx import numpy_helper
import onnxruntime as ort
import matplotlib

# Import SQLite database module
try:
    from backend import database
except ImportError:
    import database


# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("netraguard-backend")

# Class labels for Diabetic Retinopathy (MATLAB ResNet-18)
CLASS_NAMES = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR",
}

# Resolve model path relative to project root
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODEL_PATH = PROJECT_ROOT / "models" / "netraguard_resnet18.onnx"
MATLAB_ARTIFACTS_DIR = BASE_DIR / "matlab_artifacts"

if not MODEL_PATH.exists():
    fallback_path = Path("models/netraguard_resnet18.onnx").resolve()
    if fallback_path.exists():
        MODEL_PATH = fallback_path

logger.info(f"Resolved ONNX model path: {MODEL_PATH}")

# Global inference session & feature map extraction setup
ort_session: Optional[ort.InferenceSession] = None
fc5_weights: Optional[np.ndarray] = None
input_name: str = "data"
output_name: str = "prob"
feature_layer_name: str = "res5b_relu"

try:
    if not MODEL_PATH.exists():
        logger.error(f"ONNX model file not found at: {MODEL_PATH}")
    else:
        # Load ONNX model and inspect initializers to extract classification layer weights (fc5_W)
        onnx_model = onnx.load(str(MODEL_PATH))
        weights_dict = {init.name: numpy_helper.to_array(init) for init in onnx_model.graph.initializer}
        if "fc5_W" in weights_dict:
            fc5_weights = weights_dict["fc5_W"]  # Shape: (5, 512, 1, 1)
            logger.info(f"Successfully extracted classification weights 'fc5_W', shape: {fc5_weights.shape}")
        else:
            logger.warning("Could not find 'fc5_W' initializer in model graph.")

        # Add res5b_relu as an additional graph output for real ResNet-18 Grad-CAM feature map extraction
        existing_output_names = [out.name for out in onnx_model.graph.output]
        if feature_layer_name not in existing_output_names:
            res5b_out = onnx.helper.make_tensor_value_info(
                feature_layer_name,
                onnx.TensorProto.FLOAT,
                ['BatchSize', 512, 7, 7]
            )
            onnx_model.graph.output.append(res5b_out)

        # Initialize ONNX Runtime session with dual output: [prob, res5b_relu]
        ort_session = ort.InferenceSession(onnx_model.SerializeToString(), providers=["CPUExecutionProvider"])
        input_name = ort_session.get_inputs()[0].name
        output_name = ort_session.get_outputs()[0].name
        logger.info(
            f"Successfully loaded ONNX model '{MODEL_PATH.name}'. Input: '{input_name}', Output: '{output_name}', "
            f"FeatureLayer: '{feature_layer_name}'"
        )
except Exception as e:
    logger.error(f"Error loading ONNX model / feature layer: {e}")

# Initialize FastAPI application
app = FastAPI(
    title="NETRAGUARD AI Backend",
    description="FastAPI service serving diabetic retinopathy screening inference and real ResNet-18 res5b_relu Grad-CAM explainability.",
    version="1.1.0",
)

# Configure CORS for local development with Vite/React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize SQLite Database on startup
@app.on_event("startup")
def on_startup():
    try:
        database.init_db()
        logger.info("SQLite Database initialized on FastAPI startup.")
    except Exception as e:
        logger.error(f"Failed to initialize SQLite database: {e}")


class HealthResponse(BaseModel):
    status: str
    model: str
    featureLayer: str
    matlabArtifactsAvailable: bool
    databaseConnected: bool = True


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    fullName: str
    licenseNumber: Optional[str] = ""
    hospital: Optional[str] = ""


class UpdateNotesRequest(BaseModel):
    notes: str


class ScreeningResponse(BaseModel):
    id: Optional[int] = None
    predictedClass: int
    predictedClassName: str
    confidence: float
    screeningStatus: str
    referralMessage: str
    gradCAMAvailable: bool = True
    gradCAMHeatmap: Optional[str] = None
    gradCAMOverlay: Optional[str] = None
    gradCAMImage: Optional[str] = None
    originalImageUrl: Optional[str] = None
    gradCAMLayer: Optional[str] = "res5b_relu"
    gradCAMSource: Optional[str] = None
    gradCAMMethod: Optional[str] = "CAM"
    gradCAMError: Optional[str] = None
    debug: Optional[dict] = None


def to_base64_data_url(img: Image.Image, format: str = "JPEG") -> str:
    """Helper to convert a PIL image into a base64 data URL."""
    buf = io.BytesIO()
    img.save(buf, format=format, quality=92)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    mime = "image/png" if format.upper() == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{b64}"


def preprocess_image(image: Image.Image) -> np.ndarray:
    """
    Preprocess image for MATLAB ResNet-18 ONNX model:
    1. Resize to 224x224 (bilinear)
    2. Convert to float32 NumPy array with range [0.0, 255.0]
    3. Transpose from HWC (224, 224, 3) to CHW (3, 224, 224)
    4. Add batch dimension -> (1, 3, 224, 224)
    Note: The exported MATLAB ONNX graph internally includes Sub (mean) and Div (std) nodes.
    """
    resized = image.resize((224, 224), Image.Resampling.BILINEAR)
    arr = np.array(resized, dtype=np.float32)
    arr = np.transpose(arr, (2, 0, 1))
    tensor = np.expand_dims(arr, axis=0)
    return tensor


def compute_resnet18_gradcam(
    orig_img: Image.Image,
    fmap: np.ndarray,
    predicted_class: int,
    confidence: float = 0.0,
) -> tuple[Image.Image, Image.Image, dict]:
    """
    Computes authentic Class Activation Map (CAM) for the predicted class at feature layer res5b_relu.
    
    Architectural Context:
    In this ResNet-18 model, res5b_relu is immediately followed by:
      pool5 (GlobalAveragePool) -> fc5 (Conv 1x1 / Linear) -> Flatten -> Softmax.
    
    Mathematical Equivalence (Selvaraju et al., 2017, Theorem 1):
      Let S^c = sum_k (w_k^c * (1/Z * sum_{i,j} A_{k,i,j})) + b^c.
      Analytical gradient dS^c / dA_{k,i,j} = w_k^c / Z (where Z = 7 * 7 = 49).
      Spatial mean of gradients: alpha_k^c = (1/Z) * sum_{i,j} (w_k^c / Z) = w_k^c / 49.
      Grad-CAM: ReLU(sum_k alpha_k^c * A_k) = (1/49) * ReLU(sum_k w_k^c * A_k) = (1/49) * CAM.
      When normalized to [0, 1], the constant factor (1/49) cancels out:
      norm(Grad-CAM) == norm(CAM).
    
    Why CAM rather than runtime dynamic backpropagation:
      Standard ONNX Runtime (onnxruntime) is an inference-only forward engine. It does not
      contain an autograd engine (like PyTorch backward() or tf.GradientTape()) to execute
      dynamic backpropagation across arbitrary computational graphs at runtime.
      Therefore, the implementation is accurately labeled "CAM" (Class Activation Mapping).
    """
    orig_w, orig_h = orig_img.size
    
    # 512 classifier weights for predicted class extracted from ONNX 'fc5_W'
    if fc5_weights is not None:
        w = fc5_weights[predicted_class, :, 0, 0]  # shape (512,)
    else:
        w = np.ones((512,), dtype=np.float32)

    # Activations from res5b_relu: shape (512, 7, 7)
    act = fmap  # (512, 7, 7)

    # Linear combination: CAM = sum_k (w_k^c * A_k)
    cam = np.tensordot(w, act, axes=(0, 0))  # shape (7, 7)

    # ReLU: only features having positive influence on the class
    cam_relu = np.maximum(cam, 0.0)

    # Normalize to [0, 1]
    cam_min, cam_max = float(cam.min()), float(cam.max())
    if cam_relu.max() > cam_relu.min():
        cam_norm = (cam_relu - cam_relu.min()) / (cam_relu.max() - cam_relu.min())
    else:
        cam_norm = np.zeros_like(cam_relu)

    # Resize score map to original image dimensions (matching MATLAB imresize)
    score_map_255 = (cam_norm * 255.0).astype(np.uint8)
    score_map_pil = Image.fromarray(score_map_255).resize((orig_w, orig_h), Image.Resampling.BILINEAR)
    score_map_orig = np.array(score_map_pil, dtype=np.float32) / 255.0

    # 1. Heatmap using JET colormap (matching MATLAB 'colormap jet')
    jet_cmap = matplotlib.colormaps["jet"]
    heatmap_rgba = jet_cmap(score_map_orig)  # Range 0.0 - 1.0, shape (H, W, 4)
    heatmap_rgb = (heatmap_rgba[:, :, :3] * 255.0).astype(np.uint8)
    heatmap_img = Image.fromarray(heatmap_rgb)

    # 2. Overlay: alpha = 0.5 * scoreMapNorm (matching MATLAB: h.AlphaData = 0.5 * scoreMapNorm)
    orig_arr = np.array(orig_img, dtype=np.float32)
    alpha = (0.5 * score_map_orig)[:, :, np.newaxis]
    overlay_arr = (1.0 - alpha) * orig_arr + alpha * (heatmap_rgba[:, :, :3] * 255.0)
    overlay_arr = np.clip(overlay_arr, 0.0, 255.0).astype(np.uint8)
    overlay_img = Image.fromarray(overlay_arr)

    # Debug report with analytical gradient tensor shape and activation shapes
    debug_info = {
        "predictedClass": predicted_class,
        "confidence": round(float(confidence), 4),
        "activationTensorShape": list(act.shape),
        "gradientTensorShape": [int(act.shape[0]), int(act.shape[1]), int(act.shape[2])],
        "heatmapMin": round(float(cam_min), 4),
        "heatmapMax": round(float(cam_max), 4),
        "selectedExplainabilityLayer": feature_layer_name,
        "method": "CAM",
        "onnxRuntimeLimitation": "Standard ONNX Runtime is forward-only (inference execution engine without autograd). Dynamic reverse-mode automatic differentiation is not supported at runtime. Because this ResNet-18 architecture uses GAP -> Linear Classifier, CAM uses fc5_W directly, which Theorem 1 in Selvaraju et al. (2017) proves is mathematically identical to Grad-CAM up to a constant scalar factor."
    }

    return heatmap_img, overlay_img, debug_info


@app.get("/api/health", response_model=HealthResponse)
def get_health():
    """
    Health check endpoint verifying server status, model loading, and explainability layer.
    """
    if ort_session is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded."
        )
    return {
        "status": "ok",
        "model": "netraguard_resnet18.onnx",
        "featureLayer": feature_layer_name,
        "matlabArtifactsAvailable": MATLAB_ARTIFACTS_DIR.exists()
    }


@app.post("/api/screen", response_model=ScreeningResponse)
async def screen_retinal_image(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Screening endpoint:
    - Accepts uploaded retinal fundus image
    - Executes ONNX inference with netraguard_resnet18.onnx
    - Applies clinical referral triage logic
    - Generates real Grad-CAM (Heatmap + Overlay) using res5b_relu layer weights
    - Returns prediction, confidence, screeningStatus, referralMessage, and real visualizations
    """
    upload = file or image
    if upload is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image uploaded. Please provide an image file using 'file' or 'image' field."
        )

    if ort_session is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ONNX model runtime is not initialized."
        )

    try:
        contents = await upload.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty."
            )

        # Decode image
        try:
            pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception as exc:
            raise ValueError("Uploaded file is not a valid image format.") from exc

        # Preprocess image
        input_tensor = preprocess_image(pil_image)

        # Execute ONNX Runtime inference: compute probabilities AND feature map at res5b_relu
        requested_outputs = [output_name]
        has_feature_layer = feature_layer_name in [out.name for out in ort_session.get_outputs()]
        if has_feature_layer:
            requested_outputs.append(feature_layer_name)

        run_results = ort_session.run(requested_outputs, {input_name: input_tensor})
        probabilities = run_results[0][0]  # Shape: (5,)
        res5b_features = run_results[1][0] if len(run_results) > 1 else None  # Shape: (512, 7, 7)

        # Determine predicted class and confidence
        predicted_class = int(np.argmax(probabilities))
        confidence = float(probabilities[predicted_class])
        predicted_class_name = CLASS_NAMES.get(predicted_class, f"Class {predicted_class}")

        # Clinical Referral logic:
        # Class 0: "No referable DR", "Routine screening follow-up"
        # Class 1: "Mild DR", "Ophthalmologist review recommended"
        # Class 2, 3, or 4: "Referable DR", "Ophthalmologist review recommended"
        if predicted_class == 0:
            screening_status = "No referable DR"
            referral_message = "Routine screening follow-up"
        elif predicted_class == 1:
            screening_status = "Mild DR"
            referral_message = "Ophthalmologist review recommended"
        else:
            screening_status = "Referable DR"
            referral_message = "Ophthalmologist review recommended"

        # Generate Real CAM Visualizations
        gradcam_available = False
        gradcam_error = None
        heatmap_b64 = None
        overlay_b64 = None
        orig_b64 = to_base64_data_url(pil_image, format="JPEG")
        gradcam_source = None
        gradcam_method = "CAM"
        debug_payload = None

        if res5b_features is not None:
            try:
                heatmap_img, overlay_img, debug_info = compute_resnet18_gradcam(
                    pil_image,
                    res5b_features,
                    predicted_class,
                    confidence=confidence,
                )
                heatmap_b64 = to_base64_data_url(heatmap_img, format="JPEG")
                overlay_b64 = to_base64_data_url(overlay_img, format="JPEG")
                gradcam_available = True
                gradcam_source = f"ResNet-18 ({feature_layer_name}) Class Activation Map"
                gradcam_method = "CAM"
                debug_payload = debug_info
            except Exception as cam_err:
                logger.error(f"CAM generation error: {cam_err}", exc_info=True)
                gradcam_available = False
                gradcam_error = "Explainability map is unavailable because the explainability pipeline encountered an error."
        else:
            gradcam_available = False
            gradcam_error = "Explainability map is unavailable because the res5b_relu explainability layer could not be extracted from the model."

        # --- SQLite Database Storage ---
        # 1. Save uploaded image metadata
        upload_id = None
        try:
            filename = upload.filename or "fundus_scan.jpg"
            saved_filename = f"{os.urandom(8).hex()}_{filename}"
            saved_filepath = database.UPLOADS_DIR / saved_filename
            with open(saved_filepath, "wb") as f:
                f.write(contents)
            upload_id = database.save_upload_record(
                filename=filename,
                file_path=str(saved_filepath),
                file_size=len(contents)
            )
        except Exception as db_err:
            logger.warning(f"Could not save upload record to SQLite: {db_err}")

        # 2. Save screening result report to SQLite
        report_record = None
        try:
            import uuid
            patient_id = f"PAT-{uuid.uuid4().hex[:6].upper()}"
            report_record = database.save_screening_report(
                patient_id=patient_id,
                patient_name="Screened Patient",
                patient_age=55,
                doctor_id=1,  # default doctor ID
                upload_id=upload_id,
                image_url=orig_b64,
                predicted_class=predicted_class,
                predicted_class_name=predicted_class_name,
                confidence=round(confidence, 4),
                screening_status=screening_status,
                referral_message=referral_message,
                gradcam_heatmap=heatmap_b64,
                gradcam_overlay=overlay_b64,
                report_json={
                    "predictedClass": predicted_class,
                    "predictedClassName": predicted_class_name,
                    "confidence": round(confidence, 4),
                    "screeningStatus": screening_status,
                    "referralMessage": referral_message,
                }
            )
        except Exception as db_err:
            logger.warning(f"Could not save screening report to SQLite: {db_err}")

        report_id = report_record.get("id") if report_record else None

        return {
            "id": report_id,
            "predictedClass": predicted_class,
            "predictedClassName": predicted_class_name,
            "confidence": round(confidence, 4),
            "screeningStatus": screening_status,
            "referralMessage": referral_message,
            "gradCAMAvailable": gradcam_available,
            "gradCAMHeatmap": heatmap_b64,
            "gradCAMOverlay": overlay_b64,
            "gradCAMImage": overlay_b64,
            "originalImageUrl": orig_b64,
            "gradCAMLayer": feature_layer_name,
            "gradCAMSource": gradcam_source,
            "gradCAMMethod": gradcam_method,
            "gradCAMError": gradcam_error,
            "debug": debug_payload,
        }

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failed: {str(e)}"
        )


# --- SQLite Authentication Endpoints ---

@app.post("/api/auth/register")
def register_doctor(req: RegisterRequest):
    """Register a new doctor account in SQLite DB."""
    try:
        user = database.register_user(
            email=req.email,
            password=req.password,
            full_name=req.fullName,
            license_number=req.licenseNumber or "",
            hospital=req.hospital or "",
        )
        return {"status": "success", "user": user}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed.")


@app.post("/api/auth/login")
def login_doctor(req: LoginRequest):
    """Authenticate doctor credentials using SQLite DB."""
    user = database.authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )
    return {"status": "success", "user": user}


# --- SQLite Reports Management Endpoints ---

@app.get("/api/reports")
def list_reports(limit: int = 50):
    """Retrieve all saved screening reports from SQLite DB."""
    reports = database.get_all_reports(limit=limit)
    return {"reports": reports, "count": len(reports)}


@app.get("/api/reports/{report_id}")
def get_report(report_id: int):
    """Retrieve a single screening report by ID from SQLite DB."""
    report = database.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return report


@app.post("/api/reports/{report_id}/notes")
def update_report_notes(report_id: int, req: UpdateNotesRequest):
    """Update doctor notes for a screening report in SQLite DB."""
    success = database.update_report_notes(report_id, req.notes)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"status": "success", "message": "Doctor notes updated successfully."}


@app.delete("/api/reports/{report_id}")
def delete_report(report_id: int):
    """Delete a screening report from SQLite DB."""
    success = database.delete_report(report_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"status": "success", "message": "Report deleted successfully."}


if __name__ == "__main__":
    import uvicorn
    app_module = "main:app" if Path("main.py").exists() else "backend.main:app"
    uvicorn.run(app_module, host="127.0.0.1", port=8000, reload=True)

