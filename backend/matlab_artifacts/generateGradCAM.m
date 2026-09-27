%% Netraguard AI - Grad-CAM
% Person 4: Explainability

clear;
clc;

%% Load trained ResNet-18 model

modelFile = "/MATLAB Drive/DR_Screening_Project/Results/Person3/netTransfer_1epoch.mat";

data = load(modelFile);

netTransfer = data.netTransfer;

disp("Model loaded successfully.");
disp(netTransfer);

%% Load retinal image

imagePath = "/MATLAB Drive/DR_Screening_Project/Dataset/selected_images/000c1434d8d7.png";

inputImage = imread(imagePath);

figure;
imshow(inputImage);
title("Input Retinal Image");

%% Predict DR class

% Resize image to the model input size
inputImageResized = imresize(inputImage, [224 224]);

% Classify the retinal image
[predictedLabel, scores] = classify(netTransfer, inputImageResized);

% Get confidence of the predicted class
confidence = max(scores);

disp("Predicted DR Class:");
disp(predictedLabel);

disp("Confidence:");
disp(confidence);

%% Convert network for Grad-CAM

netDL = dag2dlnetwork(netTransfer);

disp("Network converted to dlnetwork successfully.");

%% Generate Grad-CAM

scoreMap = gradCAM( ...
    netDL, ...
    inputImageResized, ...
    predictedLabel, ...
    FeatureLayer="res5b_relu");

disp("Grad-CAM generated successfully.");

%% Display Grad-CAM heatmap

figure;
imagesc(scoreMap);
axis image;
colorbar;
title("Grad-CAM Heatmap");

%% Create Grad-CAM Overlay

% Resize Grad-CAM map to original image size
scoreMapOriginal = imresize(scoreMap, ...
    [size(inputImage,1), size(inputImage,2)]);

% Normalize Grad-CAM values
scoreMapNorm = rescale(scoreMapOriginal);

% Display original image
figure;
imshow(inputImage);
hold on;

% Display Grad-CAM heatmap
h = imagesc(scoreMapOriginal);

% Make heatmap transparent based on intensity
h.AlphaData = 0.5 * scoreMapNorm;

colormap jet;
colorbar;

title(sprintf("Grad-CAM - Predicted Class %s | Confidence %.2f%%", ...
    string(predictedLabel), confidence * 100));

hold off;

%% Save Grad-CAM Result

outputFolder = "/MATLAB Drive/DR_Screening_Project/Person4_Explainability_Integration/GradCAM";

outputFile = fullfile(outputFolder, "GradCAM_Class2_000c1434d8d7.png");

exportgraphics(gcf, outputFile);

disp("Grad-CAM result saved successfully.");
disp(outputFile);