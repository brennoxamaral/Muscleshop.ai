from PIL import Image, ImageDraw, ImageOps
import os

def crop_circle(logo_path, favicon_path):
    # Ensure logo exists
    if not os.path.exists(logo_path):
        raise FileNotFoundError(f"Could not find {logo_path}")
        
    img = Image.open(logo_path).convert("RGBA")
    
    # Crop to square
    size = min(img.size)
    img = ImageOps.fit(img, (size, size), centering=(0.5, 0.5))
    
    # Create mask
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    
    # Create transparent result
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask=mask)
    
    # Save as high-res PNG for favicon
    output = output.resize((256, 256), Image.Resampling.LANCZOS)
    output.save(favicon_path, "PNG")

if __name__ == "__main__":
    current_files = os.listdir(".")
    print(f"Current files: {current_files}")
    
    logo = "Logo.jpeg"
    # Find exact case match just in case
    for f in current_files:
        if f.lower() == "logo.jpeg":
            logo = f
            break
            
    out = os.path.join("public", "favicon.png")
    os.makedirs("public", exist_ok=True)
    
    try:
        crop_circle(logo, out)
        print(f"Success: Circular favicon created from {logo} to {out}")
    except Exception as e:
        print(f"Error: {e}")
