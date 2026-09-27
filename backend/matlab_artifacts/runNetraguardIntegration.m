%% Netraguard AI - End-to-End Integration
% Person 4: Explainability + Integration

clear;
clc;
close all;

%% File Paths

modelFile = ...
    "/MATLAB Drive/DR_Screening_Project/Results/Person3/netTransfer_1epoch.mat";

inputImageFile = ...
    "/MATLAB Drive/DR_Screening_Project/Results/Person2/enhanced_retinal_image.png";

gradCAMFolder = ...
    "/MATLAB Drive/DR_Screening_Project/Person4_Explainability_Integration/GradCAM";

reportFolder = ...
    "/MATLAB Drive/DR_Screening_Project/Person4_Explainability_Integration/Integration";

%% Load Person 3 AI Model

data = load(modelFile);

netTransfer = data.netTransfer;

disp("==============================================");
disp("       NETRAGUARD AI - INTEGRATION");
disp("==============================================");

disp("Person 3 AI model loaded successfully.");

%% Load Person 2 Enhanced Retinal Image

inputImage = imread(inputImageFile);

disp("Person 2 enhanced retinal image loaded successfully.");

%% Prepare Image for ResNet-18

inputImageResized = imresize(inputImage, [224 224]);

% Make sure the image has three color channels
if size(inputImageResized, 3) == 1
    inputImageResized = repmat(inputImageResized, [1 1 3]);
end

%% AI Classification

[predictedLabel, scores] = classify( ...
    netTransfer, inputImageResized);

confidence = max(scores);

predictedClass = double(string(predictedLabel));

%% Convert Class to DR Severity

if predictedClass == 0

    predictedClassName = "No DR";

elseif predictedClass == 1

    predictedClassName = "Mild DR";

elseif predictedClass == 2

    predictedClassName = "Moderate DR";

elseif predictedClass == 3

    predictedClassName = "Severe DR";

elseif predictedClass == 4

    predictedClassName = "Proliferative DR";

else

    predictedClassName = "Unknown";

end

%% Referral Decision

if predictedClass >= 2

    screeningStatus = "Referable DR";
    referralMessage = ...
        "Ophthalmologist review recommended";

elseif predictedClass == 1

    screeningStatus = "Mild DR";
    referralMessage = ...
        "Ophthalmologist review recommended";

else

    screeningStatus = "No referable DR";
    referralMessage = ...
        "Routine screening follow-up";

end

%% Display Classification Results

disp(" ");
disp("Predicted DR Class:");
disp("Class " + string(predictedClass) + ...
    " - " + predictedClassName);

disp(" ");

disp("Model Confidence:");
fprintf("%.2f%%\n", confidence * 100);

disp(" ");

disp("Screening Status:");
disp(screeningStatus);

disp(" ");

disp("Referral Information:");
disp(referralMessage);

%% Convert Network for Grad-CAM

netDL = dag2dlnetwork(netTransfer);

disp(" ");
disp("Network converted for Grad-CAM.");

%% Generate Grad-CAM

scoreMap = gradCAM( ...
    netDL, ...
    inputImageResized, ...
    predictedLabel, ...
    FeatureLayer="res5b_relu");

disp("Grad-CAM generated successfully.");

%% Create Explainability Overlay

scoreMapOriginal = imresize( ...
    scoreMap, ...
    [size(inputImage,1), size(inputImage,2)]);

scoreMapNorm = rescale(scoreMapOriginal);

figure;

imshow(inputImage);
hold on;

h = imagesc(scoreMapOriginal);

h.AlphaData = 0.5 * scoreMapNorm;

colormap jet;
colorbar;

title(sprintf( ...
    "Netraguard AI | Class %d - %s | Confidence %.2f%%", ...
    predictedClass, ...
    predictedClassName, ...
    confidence * 100));

hold off;

%% Save Integrated Explainability Result

integrationImageFile = fullfile( ...
    reportFolder, ...
    "Netraguard_Integrated_Result.png");

exportgraphics(gcf, integrationImageFile);

%% Save Integration Results

resultsFile = fullfile( ...
    reportFolder, ...
    "Netraguard_Integration_Results.mat");

save(resultsFile, ...
    "predictedClass", ...
    "predictedClassName", ...
    "confidence", ...
    "screeningStatus", ...
    "referralMessage", ...
    "integrationImageFile");

%% Final Output

disp(" ");
disp("==============================================");
disp("       INTEGRATION COMPLETED");
disp("==============================================");

disp("Input:");
disp("Person 2 enhanced retinal image");

disp(" ");

disp("AI Classification:");
disp("Person 3 ResNet-18");

disp(" ");

disp("Explainability:");
disp("Grad-CAM");

disp(" ");

disp("Integrated Result:");
disp(integrationImageFile);

disp(" ");

disp("Results File:");
disp(resultsFile);

disp("==============================================");