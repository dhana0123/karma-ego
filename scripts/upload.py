"""
upload.py - Upload vendor data to HuggingFace
Usage: python upload.py --vendor Bellu
"""

import os
import argparse
from huggingface_hub import HfApi

# Change this to your HuggingFace username
REPO_ID = "Karma-ego/global"


def upload_vendor(vendor, tag=None):
    api = HfApi()
    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"

    video_dir    = f"./videos/vendor_{vendor}"
    global_meta  = "./metadata/global_metadata.csv"

    print(f"Uploading vendor: {vendor}")
    print(f"Repo: {REPO_ID}\n")

    # Check folders exist
    if not os.path.exists(video_dir):
        print(f"Error: {video_dir} not found. Run intake.py first.")
        return

    if not os.path.exists(global_meta):
        print(f"Error: {global_meta} not found. Run intake.py first.")
        return

    # Show what will be uploaded
    videos = [f for f in os.listdir(video_dir) if f.endswith(".mp4")]
    print(f"Videos found : {len(videos)}")
    print(f"Vendor       : {vendor}\n")

    # Confirm
    deid = input("Are all videos de-identified? (yes/no): ").strip().lower()
    if deid != "yes":
        print("Upload cancelled. De-identify videos first.")
        return

    meta_ok = input("Is metadata complete with task labels? (yes/no): ").strip().lower()
    if meta_ok != "yes":
        print("Upload cancelled. Complete metadata first.")
        return

    # Upload videos
    print("\nStep 1/2 - Uploading videos...")
    try:
        api.upload_folder(
            folder_path=video_dir,
            path_in_repo=f"videos/vendor_{vendor}",
            repo_id=REPO_ID,
            repo_type="dataset",
            commit_message=f"Add vendor {vendor} videos",
        )
        print("Videos uploaded.\n")
    except Exception as e:
        print(f"Video upload failed: {e}")
        return

    # Upload global metadata
    print("Step 2/2 - Uploading global metadata...")
    try:
        api.upload_file(
            path_or_fileobj=global_meta,
            path_in_repo="metadata/global_metadata.csv",
            repo_id=REPO_ID,
            repo_type="dataset",
            commit_message=f"Update global metadata for {vendor}"
        )
        print("Global metadata uploaded.\n")
    except Exception as e:
        print(f"Global metadata failed: {e}")

    print(f"Upload complete.")
    print(f"https://huggingface.co/datasets/{REPO_ID}\n")

    # Tag version
    tag = tag or input("Tag a version? (e.g. v0.1 or skip): ").strip()
    if tag and tag.lower() != "skip":
        try:
            api.create_tag(
                repo_id=REPO_ID,
                repo_type="dataset",
                tag=tag,
                tag_message=f"Release {tag} - added {vendor}"
            )
            print(f"Tagged {tag}")
        except Exception as e:
            print(f"Tagging failed: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Karma-Ego vendor upload")
    parser.add_argument("--vendor", required=True, help="Vendor name e.g. Bellu")
    parser.add_argument("--tag",    default=None,  help="Version tag e.g. v0.1")
    args = parser.parse_args()

    upload_vendor(
        vendor=args.vendor,
        tag=args.tag
    )