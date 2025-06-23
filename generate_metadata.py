import os
import json

# Directory containing the images
image_dir = '.'

# Description for all NFTs (customize as needed)
description = "A unique Llama PFP from the Test NFT Collection."

# Placeholder for the IPFS image link (to be replaced after upload)
image_ipfs_placeholder = "ipfs://<CID>/<FILENAME>"

# Loop through all files in the directory
for filename in os.listdir(image_dir):
    if filename.lower().endswith('.jpg'):
        # Extract the base name without extension
        base_name = os.path.splitext(filename)[0]
        # Prepare metadata
        metadata = {
            "name": base_name,
            "description": description,
            "image": image_ipfs_placeholder.replace('<FILENAME>', filename)
        }
        # Write metadata to a JSON file
        json_filename = f"{base_name}.json"
        with open(os.path.join(image_dir, json_filename), 'w') as f:
            json.dump(metadata, f, indent=4) 