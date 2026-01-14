from setuptools import setup

setup(
    name="shot-detector",
    version="0.1.0",
    description="Basketball shot detector using object detection",
    py_modules=["app", "shot_detector", "utils"],
    install_requires=[
        # Object Detection Requirements
        "cvzone==1.5.6",
        "ultralytics",
        "hydra-core>=1.2.0",
        "matplotlib>=3.2.2",
        "numpy>=1.18.5",
        "opencv-python==4.5.4.60",
        "Pillow>=7.1.2",
        "PyYAML>=5.3.1",
        "requests>=2.23.0",
        "scipy>=1.4.1",
        "torch>=1.7.0",
        "torchvision>=0.8.1",
        "tqdm>=4.64.0",
        "filterpy==1.4.5",
        "scikit-image==0.19.3",
        # "lap==0.4.0",  # 暂时注释，避免构建问题
        
        # API Requirements
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0.post1",
        "python-multipart==0.0.6",
        "pydantic==2.5.2",
        "pydantic-settings==2.1.0",
    ],
    setup_requires=[
        "numpy>=1.18.5",
    ],
)