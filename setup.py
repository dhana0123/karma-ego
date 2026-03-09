from setuptools import setup, find_packages

setup(
    name="karma-ego",
    version="0.1.0",
    description="Open egocentric dataset for physical AI",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Karma-Ego Initiative",
    url="https://github.com/karma-ego/karma-ego",
    packages=find_packages(),
    install_requires=[
        "huggingface_hub>=0.32.0",
        "hf_transfer",
    ],
    extras_require={
        "fast": ["hf_xet"],
    },
    entry_points={
        "console_scripts": [
            "karmaego=karma_ego.cli:main",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    keywords=[
        "egocentric", "video", "dataset",
        "physical-ai", "robotics", "first-person"
    ],
)