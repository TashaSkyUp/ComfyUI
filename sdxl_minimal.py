import os.path

print("testing now")

import torch
import sys
full_path_to_comfy =os.path.abspath("./comfy")
sys.path.append(full_path_to_comfy)

from comfy.sd import load_checkpoint_guess_config

try:
    out = load_checkpoint_guess_config("e:\\ML_MODELS\\Stable-diffusion\\sd_xl_base_0.9.safetensors")
except:
    out = load_checkpoint_guess_config("model.ckpt")

print(type(out), dir(out))
model = out[0]
clip = out[1]
vae = out[2]
print(type(model), dir(model))

positive_text = "a kid with their dog looking at a sunset over a mountain scene with a lake, perfect anatomy and a beautiful happy dog"
negitive_text = "blurry amateur"

width = 1024
height = 1024
# latent is just a dictionary, with a key "samples" that contains a tensor
latent_data = torch.zeros([1, 4, width // 8, height // 8])
latent_dict = {"samples": latent_data}

pos_cond = None
neg_cond = None
seed = 142132
one_seed_per_batch = True
denoise = 1.0
steps = 20
cfg = 8
sampler_name = "euler"
scheduler = "normal"

batch_size = 1

# positive and negative conditionings
tokens = clip.tokenize(positive_text)
cond, pooled = clip.encode_from_tokens(tokens, return_pooled=True)
positive_cond = [[cond, {"pooled_output": pooled}]]

tokens = clip.tokenize(positive_text)
cond, pooled = clip.encode_from_tokens(tokens, return_pooled=True)
negitive_cond = [[cond, {"pooled_output": pooled}]]

# Sampler

device = "cuda"

# generate the first noise and then repeat it for the rest of the batch
sz = latent_data.size()
sz = (1, sz[1], sz[2], sz[3])
noise = torch.randn(sz, dtype=latent_data.dtype, layout=latent_data.layout,
                    generator=torch.manual_seed(seed), device="cpu")
noise = torch.cat([noise] * latent_data.shape[0])

real_model = None

real_model = model.model

noise = noise.to(device)
latent_data = latent_data.to(device)

from comfy.sample import sample

samples = sample(model,
                 noise,
                 steps,
                 cfg,
                 sampler_name,
                 scheduler,
                 positive_cond,
                 negitive_cond,
                 latent_data,
                 denoise=denoise,
                 disable_noise=False,
                 start_step=None,
                 last_step=None,
                 force_full_denoise=False,
                 noise_mask=None,
                 callback=None
                 )

image = vae.decode(samples)
# image = vae.decode(samples["samples"])
image = image.detach().cpu()

# image is an image tensor now, so lets turn it into a pil image
from PIL import Image
import numpy as np

image = Image.fromarray(np.uint8(image[0].permute(0, 1, 2) * 255))
image.show()

# there gets to be a bit to much going on here to linearize it so here ill start importing the functions/modules
