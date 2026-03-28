# Karma-Ego

**The open registry for egocentric video data.**


Karma-Ego is an open registry and discovery interface for egocentric video datasets. Search, filter, compare, and access first-person video data from labs, platforms, and field deployments worldwide — via CLI or the web. One structured index. Every dataset, one command away.

Community-maintained, open by design, and built for the pace of research.

**[Website](https://karma-ego.org) · [HuggingFace](https://huggingface.co/datasets/karma-ego/global) · [Contribute a Dataset](contributor.md)**

---

## Install

```bash
pip install karma-ego
```

---

## Quick Start

```bash
# Download by task
karmaego download --task cooking --country India

# Download specific vendor
karmaego download --vendor VisionLabs --flat

# Download with technical filters
karmaego download --task cooking --fps 60 --resolution 4K

# Search vendors
karmaego vendors --task cooking --country India

# Metadata only (fast)
karmaego download --metadata-only

# Specific version
karmaego download --task cooking --version v1.0
```

---

## Python API

```python
from datasets import load_dataset

ds = load_dataset("karma-ego/global", streaming=True)
for sample in ds["train"]:
    print(sample["video_uid"], sample["coarse_task"])
```

---

## Dataset Structure

```
karma-ego/
├── videos/
│   ├── vendor_VisionLabs/
│   │   ├── VL_00001.mp4
│   │   └── VL_00002.mp4
│   └── vendor_StudioAlpha/
│       └── SA_00001.mp4
├── metadata/
│   ├── global_metadata.csv
│   ├── vendor_catalog.csv
│   ├── VisionLabs_metadata.csv
│   └── StudioAlpha_metadata.csv
├── registry/
│   └── datasets/           # One YAML file per indexed dataset
└── README.md
```

---

## Metadata Schema

| Column | Description |
|---|---|
| `video_uid` | Unique video ID |
| `vendor` | Vendor name |
| `country` | Collection country |
| `device` | Camera device |
| `fps` | Frames per second |
| `resolution` | Video resolution |
| `duration_sec` | Duration in seconds |
| `coarse_task` | Main task category |
| `fine_task` | Detailed task description |
| `split` | train / val / test |

---

## Registry Schema

Each dataset in `/registry/datasets/` follows this YAML structure:

```yaml
name: Your Dataset Name
institution: University / Research Lab / Company
dataset_page: https://your-dataset-page.com
volume_hours: 120
modalities: [rgb, depth, imu, gaze]
license: CC BY 4.0
paper_url: https://arxiv.org/abs/xxxx.xxxxx
access_url: https://your-dataset-page.com
contact: maintainer@institution.edu
country: Your Country
task_type: [task name, activity type]
data_type: egocentric video
publisher: https://your-publisher-url.com
```

---

## Roadmap

- [x] YAML registry schema + GitHub-hosted index
- [x] CLI: `karmaego download` and `karmaego vendors`
- [x] HuggingFace dataset (`karma-ego/global`) with Python API
- [x] Website live at karma-ego.org
- [x] Standardized metadata schema across all datasets
- [ ] `karmaego search` — keyword search across registry
- [ ] `karmaego list` — filter by task type, modality, country, size, license
- [ ] `karmaego validate` — validate YAML before PR submission
- [ ] `karmaego export` — export results as JSON / CSV
- [ ] `karmaego suggest` — dataset suggestions from free-text task description
- [ ] Aggregate datasets from research papers, academic labs, and platforms
- [ ] REST API for programmatic access
- [ ] BibTeX citation export per dataset

---

## License

- **Code:** MIT  
- **Dataset:** CC-BY-4.0

All datasets remain property of their respective maintainers. Karma-Ego is not affiliated with Meta, CMU, or any indexed institution.