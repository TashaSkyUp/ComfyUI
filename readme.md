install your python environment with pytorch and torchvision this project will actually fail if your dont have pytorch compiled with gpu support



https://pytorch.org/get-started/locally/

for windows, pip, nightly dev build cuda 12.1
```cmd
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu121
```
linux
```bash
pip3 install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu121
```
use the requirements.txt to install the rest of the packages
```cmd
pip3 install -r requirements.txt
```
the comfy folder is the inner workings as far as model loading and sampling for the comfyui project

sdxl_minimal.py shows how to sample
please put the model in the same folder as sdxl_minimal.py and name it **model.ckpt**

then hopefully running the sdxl_minimal.py will work!