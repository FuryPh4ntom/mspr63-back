# predict_species.py
import sys
from transformers import ViTForImageClassification
from torchvision import transforms
from PIL import Image
import torch
import torch.nn.functional as F
import os
import json

# Chargement des labels
with open(r"labels.txt", "r") as f:
    labels = [line.strip() for line in f.readlines()]

# Chargement du modèle
model = ViTForImageClassification.from_pretrained(
    "WinKawaks/vit-tiny-patch16-224",
    num_labels=len(labels),
    ignore_mismatched_sizes=True
)
model.load_state_dict(torch.load(r"model_empreinte_vit.pth", map_location=torch.device('cpu')))
model.eval()

def predict(img_path):
    img = Image.open(img_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])
    img_tensor = transform(img).unsqueeze(0)

    with torch.no_grad():
        outputs = model(pixel_values=img_tensor)
        pred_index = torch.argmax(outputs.logits, dim=1).item()
        probs = torch.nn.functional.softmax(outputs.logits, dim=1)[0]
        top_probs = sorted([(labels[i], float(probs[i])) for i in range(len(labels))], key=lambda x: x[1], reverse=True)

        result = {
            "predicted_species": labels[pred_index],
            "probabilities": top_probs[:5]  # top 5
        }
        print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python predict_species.py <image_path>"}))
        sys.exit(1)

    image_path = sys.argv[1]
    predict(image_path)
