"""
Karma-Ego Upload Script — Upload video datasets to Hugging Face Hub
"""

import os
import json
import argparse
from pathlib import Path
from datasets import Dataset, DatasetDict, Features, Value, Sequence
from huggingface_hub import HfApi
import pandas as pd


def create_video_dataset(data_dir, metadata_file=None):
    """
    Create a Hugging Face dataset from video files and metadata.

    Args:
        data_dir: Directory containing video files
        metadata_file: Path to CSV/JSON metadata file

    Returns:
        Dataset: Hugging Face dataset
    """
    data_dir = Path(data_dir)

    # Find all video files
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    video_files = []
    for ext in video_extensions:
        video_files.extend(data_dir.glob(f'**/*{ext}'))

    if not video_files:
        raise ValueError(f"No video files found in {data_dir}")

    # Load metadata if provided
    metadata = {}
    if metadata_file:
        metadata_path = Path(metadata_file)
        if metadata_path.suffix == '.csv':
            df = pd.read_csv(metadata_path)
            # Assume first column is filename
            filename_col = df.columns[0]
            for _, row in df.iterrows():
                filename = row[filename_col]
                metadata[filename] = row.to_dict()
        elif metadata_path.suffix == '.json':
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)

    # Create dataset
    data = []
    for video_path in video_files:
        rel_path = video_path.relative_to(data_dir)
        entry = {
            'video': str(video_path),
            'filename': video_path.name,
            'path': str(rel_path)
        }

        # Add metadata if available
        if video_path.name in metadata:
            entry.update(metadata[video_path.name])

        data.append(entry)

    # Define features
    features = Features({
        'video': Value('string'),  # Path to video file
        'filename': Value('string'),
        'path': Value('string')
    })

    # Add metadata features dynamically
    if metadata:
        sample_meta = next(iter(metadata.values()))
        for key, value in sample_meta.items():
            if isinstance(value, str):
                features[key] = Value('string')
            elif isinstance(value, int):
                features[key] = Value('int64')
            elif isinstance(value, float):
                features[key] = Value('float64')
            else:
                features[key] = Value('string')  # Default to string

    return Dataset.from_list(data, features=features)


def upload_dataset(dataset, repo_id, token=None, private=False):
    """
    Upload dataset to Hugging Face Hub.

    Args:
        dataset: Hugging Face Dataset
        repo_id: Repository ID (e.g., 'username/dataset-name')
        token: Hugging Face API token
        private: Whether to make the dataset private
    """
    api = HfApi(token=token)

    # Create repository if it doesn't exist
    try:
        api.repo_info(repo_id, repo_type='dataset')
    except:
        api.create_repo(repo_id, repo_type='dataset', private=private)

    # Push dataset
    dataset.push_to_hub(repo_id, token=token, private=private)


def main():
    parser = argparse.ArgumentParser(
        description="Upload video dataset to Hugging Face Hub"
    )
    parser.add_argument(
        'data_dir',
        help='Directory containing video files'
    )
    parser.add_argument(
        '--metadata',
        help='Path to metadata CSV or JSON file'
    )
    parser.add_argument(
        '--repo-id',
        required=True,
        help='Hugging Face repository ID (e.g., username/dataset-name)'
    )
    parser.add_argument(
        '--token',
        help='Hugging Face API token (or set HF_TOKEN env var)'
    )
    parser.add_argument(
        '--private',
        action='store_true',
        help='Make the dataset private'
    )

    args = parser.parse_args()

    # Get token from env if not provided
    token = args.token or os.getenv('HF_TOKEN')
    if not token:
        raise ValueError("Hugging Face token required. Use --token or set HF_TOKEN env var")

    print("Creating dataset...")
    dataset = create_video_dataset(args.data_dir, args.metadata)

    print(f"Dataset created with {len(dataset)} samples")
    print(f"Uploading to {args.repo_id}...")

    upload_dataset(dataset, args.repo_id, token=token, private=args.private)

    print("✅ Upload complete!")


if __name__ == '__main__':
    main()</content>
<parameter name="filePath">c:\Users\Sagar\Music\karma-ego\scripts\upload.py
