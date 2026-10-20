#!/usr/bin/env python3
"""
CGaRd Video & AI Audio Generator
Generates:
1. public/videos/cgard_explainer_16x9.mp4 (1920x1080 with AI voice narration)
2. public/videos/cgard_explainer_9x16.mp4 (1080x1920 with AI voice narration)
3. public/videos/cgard_voiceover.mp3 (Standalone audio track)
"""

import os
import shutil
import subprocess
import math

FPS = 12
DURATION = 30
TOTAL_FRAMES = FPS * DURATION

CLIPS = [
    (0.5, "Every bottle makes a promise."),
    (3.2, "Claims sit behind regulatory paperwork."),
    (5.5, "Know if the claim was ever checked."),
    (8.0, "See which rule the claim sits under."),
    (10.5, "Spot when there is no test on file."),
    (13.0, "See how many listed actives have proof."),
    (15.5, "Know which words the rules allow."),
    (18.0, "Watch how the claim changed over time."),
    (21.0, "All regulatory facts reassemble into one card."),
    (24.5, "Claims. Certified does not equal effective."),
    (28.0, "See how it works at cgard dot app.")
]

def generate_voiceover_audio(out_wav="/tmp/full_narration.wav", out_mp3="public/videos/cgard_voiceover.mp3"):
    print("Synthesizing AI Audio Voiceover using libflite...")
    os.makedirs("/tmp/audio_clips", exist_ok=True)
    inputs = []
    filter_parts = []
    for i, (delay, text) in enumerate(CLIPS):
        wav_path = f"/tmp/audio_clips/clip_{i}.wav"
        cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"flite=text=\x27{text}\x27:voice=slt", wav_path]
        subprocess.check_call(cmd, stderr=subprocess.DEVNULL)
        inputs.extend(["-i", wav_path])
        delay_ms = int(delay * 1000)
        filter_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms}[a{i}]")

    mix_inputs = "".join(f"[a{i}]" for i in range(len(CLIPS)))
    filter_complex = ";".join(filter_parts) + f";{mix_inputs}amix=inputs={len(CLIPS)}:normalize=0,apad=whole_dur=30[aout]"
    full_cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", filter_complex, "-map", "[aout]", "-t", "30", out_wav]
    subprocess.check_call(full_cmd, stderr=subprocess.DEVNULL)
    
    # Also export as MP3 for web audio playback
    mp3_cmd = ["ffmpeg", "-y", "-i", out_wav, "-c:a", "libmp3lame", "-b:a", "128k", out_mp3]
    subprocess.check_call(mp3_cmd, stderr=subprocess.DEVNULL)
    print(f"Voiceover generated: {out_mp3} ({os.path.getsize(out_mp3)} bytes)")

def render_svg_frame(frame_idx, width, height, aspect="16:9"):
    t = frame_idx / FPS
    is_vertical = (aspect == "9:16")
    cx = width / 2
    cy = height / 2
    
    bg_gradient = """
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B"/>
        <stop offset="60%" stop-color="#141E28"/>
        <stop offset="100%" stop-color="#0F172A"/>
      </linearGradient>
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
        <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.08"/>
        <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.03"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="bottleSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D4AF37"/>
        <stop offset="50%" stop-color="#A87B4E"/>
        <stop offset="100%" stop-color="#8C6036"/>
      </linearGradient>
    </defs>
    """
    
    elements = []
    elements.append(f'<rect width="{width}" height="{height}" fill="url(#bgGrad)"/>')
    elements.append(f'<circle cx="{cx*0.7}" cy="{cy*0.8}" r="{min(width,height)*0.45}" fill="#A87B4E" opacity="0.04"/>')
    elements.append(f'<circle cx="{cx*1.3}" cy="{cy*1.2}" r="{min(width,height)*0.4}" fill="#38BDF8" opacity="0.03"/>')
    
    bottle_visible = t < 25.0
    bottle_opacity = 0.0
    
    if t < 3.0:
        progress = t / 3.0
        bottle_opacity = min(1.0, progress * 1.1)
    elif t < 22.0:
        bottle_opacity = 1.0
    elif t < 25.0:
        bottle_opacity = max(0.0, 1.0 - (t - 22.0) / 2.5)
    
    if bottle_visible and bottle_opacity > 0.01:
        bw = width * 0.16 if not is_vertical else width * 0.34
        bh = bw * 2.3
        bx = cx - bw / 2
        by = cy - bh / 2 + (0 if is_vertical else -20)
        sheen_x = bx - bw + (bw * 3.0) * (min(4.0, t) / 4.0)
        
        bottle_svg = f"""
        <g opacity="{bottle_opacity:.2f}">
          <rect x="{bx}" y="{by + bh*0.2}" width="{bw}" height="{bh*0.78}" rx="{bw*0.18}" fill="url(#glassGrad)" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="2.5"/>
          <path d="M {bx + bw*0.25} {by + bh*0.08} L {bx + bw*0.25} {by + bh*0.2} L {bx} {by + bh*0.28}" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2"/>
          <path d="M {bx + bw*0.75} {by + bh*0.08} L {bx + bw*0.75} {by + bh*0.2} L {bx + bw} {by + bh*0.28}" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="2"/>
          <rect x="{bx + bw*0.25}" y="{by}" width="{bw*0.5}" height="{bh*0.1}" rx="{bw*0.06}" fill="#2C3E50" stroke="#A87B4E" stroke-opacity="0.5" stroke-width="2"/>
          <line x1="{bx + bw*0.12}" y1="{by + bh*0.26}" x2="{bx + bw*0.12}" y2="{by + bh*0.9}" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>
          <line x1="{bx + bw*0.88}" y1="{by + bh*0.28}" x2="{bx + bw*0.88}" y2="{by + bh*0.88}" stroke="#FFFFFF" stroke-opacity="0.15" stroke-width="2" stroke-linecap="round"/>
          <rect x="{sheen_x}" y="{by}" width="{bw*0.4}" height="{bh}" fill="url(#bottleSheen)" transform="skewX(-20)"/>
        </g>
        """
        elements.append(bottle_svg)
        
        if t >= 3.0 and t < 22.0:
            frame_prog = min(1.0, (t - 3.0) / 1.5)
            fx = bx - bw*0.18
            fy = by - bh*0.05
            fw = bw * 1.36
            fh = bh * 1.1
            dash_len = (fw + fh) * 2
            dash_offset = dash_len * (1.0 - frame_prog)
            elements.append(f"""
            <rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" rx="14" fill="none" stroke="#A87B4E" stroke-width="2" stroke-dasharray="{dash_len}" stroke-dashoffset="{dash_offset:.1f}" stroke-opacity="0.75"/>
            <path d="M {fx-6} {fy+14} L {fx-6} {fy-6} L {fx+14} {fy-6}" fill="none" stroke="#A87B4E" stroke-width="2"/>
            <path d="M {fx+fw+6} {fy+14} L {fx+fw+6} {fy-6} L {fx+fw-14} {fy-6}" fill="none" stroke="#A87B4E" stroke-width="2"/>
            <path d="M {fx-6} {fy+fh-14} L {fx-6} {fy+fh+6} L {fx+14} {fy+fh+6}" fill="none" stroke="#A87B4E" stroke-width="2"/>
            <path d="M {fx+fw+6} {fy+fh-14} L {fx+fw+6} {fy+fh+6} L {fx+fw-14} {fy+fh+6}" fill="none" stroke="#A87B4E" stroke-width="2"/>
            """)

    caption_y = height * 0.88 if not is_vertical else height * 0.86
    caption_text = ""
    
    if t < 3.5:
        caption_text = "Every bottle makes a promise."
    
    def spring_prog(st, dur=0.6):
        if t < st:
            return 0.0
        elapsed = t - st
        if elapsed > dur:
            return 1.0
        tau = elapsed / dur
        return 1.0 - math.exp(-6 * tau) * math.cos(8 * tau)
    
    comp_positions = [
        (-width*0.28, -height*0.22),
        ( width*0.28, -height*0.22),
        (-width*0.32,  0),
        ( width*0.32,  0),
        (-width*0.28,  height*0.22),
        ( width*0.28,  height*0.22)
    ] if not is_vertical else [
        (-width*0.26, -height*0.28),
        ( width*0.26, -height*0.28),
        (-width*0.28, -height*0.14),
        ( width*0.28, -height*0.14),
        (-width*0.26,  0),
        ( width*0.26,  0)
    ]
    
    reassemble_t = 0.0
    slide_away_t = 0.0
    if t >= 20.0 and t < 24.0:
        reassemble_t = min(1.0, (t - 20.0) / 1.5)
        if t >= 22.5:
            slide_away_t = (t - 22.5) / 1.5
    
    components_info = [
        (5.0, 7.5, "Know if the claim was ever checked."),
        (7.5, 10.0, "See which rule the claim sits under."),
        (10.0, 12.5, "Spot when there is no test on file."),
        (12.5, 15.0, "See how many listed actives have proof."),
        (15.0, 17.5, "Know which words the rules allow."),
        (17.5, 20.0, "Watch how the claim changed over time.")
    ]
    
    if 5.0 <= t < 20.0:
        for idx, (st, et, ben_text) in enumerate(components_info):
            if st <= t < et:
                caption_text = ben_text
                break
    elif 20.0 <= t < 24.0:
        caption_text = "All regulatory facts reassemble into one card."
    
    for idx, (st, et, ben_text) in enumerate(components_info):
        if t >= st and t < 24.0:
            sp = spring_prog(st)
            orig_x, orig_y = comp_positions[idx]
            curr_x = cx + orig_x * sp
            curr_y = cy + orig_y * sp
            
            if reassemble_t > 0:
                card_slot_x = cx + (-(width*0.08) if idx%2==0 else (width*0.08))
                card_slot_y = cy - (height*0.12) + (idx // 2) * (height*0.08)
                curr_x = curr_x * (1.0 - reassemble_t) + card_slot_x * reassemble_t
                curr_y = curr_y * (1.0 - reassemble_t) + card_slot_y * reassemble_t
            
            if slide_away_t > 0:
                curr_x += slide_away_t * slide_away_t * width * 1.2
            
            box_sz = 68 if not is_vertical else 56
            tile_svg = f"""
            <g transform="translate({curr_x - box_sz/2}, {curr_y - box_sz/2})">
              <rect width="{box_sz}" height="{box_sz}" rx="14" fill="#1E293B" fill-opacity="0.9" stroke="#A87B4E" stroke-opacity="0.4" stroke-width="2"/>
            """
            
            if idx == 0:
                tile_svg += f"""
                <circle cx="{box_sz*0.35}" cy="{box_sz*0.5}" r="{box_sz*0.13}" fill="none" stroke="#F5F2EB" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="{box_sz*0.65}" cy="{box_sz*0.5}" r="{box_sz*0.13}" fill="none" stroke="#F5F2EB" stroke-width="2.2" stroke-linecap="round"/>
                """
            elif idx == 1:
                tile_svg += f"""
                <rect x="{box_sz*0.25}" y="{box_sz*0.2}" width="{box_sz*0.5}" height="{box_sz*0.6}" rx="3" fill="none" stroke="#F5F2EB" stroke-width="2" stroke-linecap="round"/>
                <line x1="{box_sz*0.35}" y1="{box_sz*0.35}" x2="{box_sz*0.65}" y2="{box_sz*0.35}" stroke="#F5F2EB" stroke-width="2" stroke-linecap="round"/>
                <line x1="{box_sz*0.35}" y1="{box_sz*0.48}" x2="{box_sz*0.65}" y2="{box_sz*0.48}" stroke="#F5F2EB" stroke-width="2" stroke-linecap="round"/>
                <circle cx="{box_sz*0.6}" cy="{box_sz*0.62}" r="{box_sz*0.1}" fill="none" stroke="#A87B4E" stroke-width="2" stroke-dasharray="2,2"/>
                """
            elif idx == 2:
                tile_svg += f"""
                <rect x="{box_sz*0.2}" y="{box_sz*0.3}" width="{box_sz*0.6}" height="{box_sz*0.42}" rx="6" fill="none" stroke="#A87B4E" stroke-width="2.2" stroke-dasharray="4,4" stroke-linecap="round"/>
                <line x1="{box_sz*0.35}" y1="{box_sz*0.51}" x2="{box_sz*0.65}" y2="{box_sz*0.51}" stroke="#A87B4E" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4"/>
                """
            elif idx == 3:
                tile_svg += f"""
                <circle cx="{box_sz*0.23}" cy="{box_sz*0.5}" r="{box_sz*0.08}" fill="#A87B4E" stroke="#A87B4E" stroke-width="2"/>
                <circle cx="{box_sz*0.41}" cy="{box_sz*0.5}" r="{box_sz*0.08}" fill="none" stroke="#F5F2EB" stroke-width="2"/>
                <circle cx="{box_sz*0.59}" cy="{box_sz*0.5}" r="{box_sz*0.08}" fill="none" stroke="#F5F2EB" stroke-width="2"/>
                <circle cx="{box_sz*0.77}" cy="{box_sz*0.5}" r="{box_sz*0.08}" fill="none" stroke="#F5F2EB" stroke-width="2"/>
                """
            elif idx == 4:
                tile_svg += f"""
                <path d="M {box_sz*0.2} {box_sz*0.25} L {box_sz*0.8} {box_sz*0.25} C {box_sz*0.85} {box_sz*0.25} {box_sz*0.85} {box_sz*0.65} {box_sz*0.8} {box_sz*0.65} L {box_sz*0.45} {box_sz*0.65} L {box_sz*0.32} {box_sz*0.78} L {box_sz*0.35} {box_sz*0.65} L {box_sz*0.2} {box_sz*0.65} C {box_sz*0.15} {box_sz*0.65} {box_sz*0.15} {box_sz*0.25} {box_sz*0.2} {box_sz*0.25} Z" fill="none" stroke="#F5F2EB" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
                <line x1="{box_sz*0.3}" y1="{box_sz*0.45}" x2="{box_sz*0.7}" y2="{box_sz*0.45}" stroke="#F5F2EB" stroke-width="2"/>
                <line x1="{box_sz*0.35}" y1="{box_sz*0.38}" x2="{box_sz*0.65}" y2="{box_sz*0.52}" stroke="#A87B4E" stroke-width="2.2" stroke-linecap="round"/>
                """
            elif idx == 5:
                tile_svg += f"""
                <line x1="{box_sz*0.2}" y1="{box_sz*0.5}" x2="{box_sz*0.8}" y2="{box_sz*0.5}" stroke="#F5F2EB" stroke-width="2" stroke-linecap="round"/>
                <circle cx="{box_sz*0.25}" cy="{box_sz*0.5}" r="{box_sz*0.07}" fill="#F5F2EB"/>
                <circle cx="{box_sz*0.5}"  cy="{box_sz*0.5}" r="{box_sz*0.07}" fill="#A87B4E"/>
                <circle cx="{box_sz*0.75}" cy="{box_sz*0.5}" r="{box_sz*0.07}" fill="#F5F2EB"/>
                """
            
            tile_svg += "</g>"
            elements.append(tile_svg)

    if 20.0 <= t < 24.0:
        c_prog = min(1.0, (t - 20.0) / 1.5)
        card_w = min(width, height) * 0.55
        card_h = card_w * 0.72
        card_x = cx - card_w/2
        card_y = cy - card_h/2 - (0 if is_vertical else 20)
        
        if slide_away_t > 0:
            card_x += slide_away_t * slide_away_t * width * 1.2
            
        elements.append(f"""
        <rect x="{card_x}" y="{card_y}" width="{card_w}" height="{card_h}" rx="20" fill="none" stroke="#A87B4E" stroke-width="2.5" stroke-opacity="{c_prog:.2f}" stroke-dasharray="6,6"/>
        """)

    if 24.0 <= t < 28.0:
        logo_prog = min(1.0, (t - 24.0) / 1.0)
        caption_text = "Claims: certified ≠ effective."
        logo_y = cy - 70
        elements.append(f"""
        <g transform="translate({cx - 50}, {logo_y})" opacity="{logo_prog:.2f}">
          <polygon points="50,60 80,75 50,90 20,75" fill="#A87B4E" fill-opacity="0.4" stroke="#A87B4E" stroke-width="1.8"/>
          <polygon points="50,42 80,57 50,72 20,57" fill="#1E293B" stroke="#334155" stroke-width="1.8"/>
          <polygon points="50,24 80,39 50,54 20,39" fill="#A87B4E" fill-opacity="0.5" stroke="#F5F2EB" stroke-width="2"/>
        </g>
        <text x="{cx}" y="{logo_y + 130}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="44" fill="#FFFFFF" opacity="{logo_prog:.2f}">
          C<tspan fill="#FFFFFF">G</tspan><tspan fill="#F5F2EB">a</tspan><tspan fill="#FFFFFF">R</tspan><tspan fill="#F5F2EB">d</tspan>
        </text>
        <text x="{cx}" y="{logo_y + 164}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="20" fill="#A87B4E" opacity="{logo_prog:.2f}">
          Claims: certified ≠ effective.
        </text>
        """)

    if t >= 28.0:
        end_prog = min(1.0, (t - 28.0) / 0.8)
        caption_text = "See how it works"
        elements.append(f"""
        <g opacity="{end_prog:.2f}">
          <rect x="{cx - 180}" y="{cy - 90}" width="360" height="180" rx="20" fill="#1E293B" stroke="#A87B4E" stroke-width="2.5"/>
          <text x="{cx}" y="{cy - 20}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="28" fill="#FFFFFF">
            See how it works
          </text>
          <rect x="{cx - 130}" y="{cy + 10}" width="260" height="48" rx="10" fill="#A87B4E"/>
          <text x="{cx}" y="{cy + 41}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-weight="700" font-size="16" fill="#FFFFFF">
            cgard.app/how-it-works
          </text>
        </g>
        """)

    if caption_text:
        bar_w = min(width * 0.85, 780)
        bar_h = 48
        elements.append(f"""
        <g transform="translate({cx - bar_w/2}, {caption_y - bar_h/2})">
          <rect width="{bar_w}" height="{bar_h}" rx="12" fill="#0F172A" fill-opacity="0.85" stroke="#334155" stroke-width="1.5"/>
          <text x="{bar_w/2}" y="{bar_h/2 + 6}" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="19" fill="#F5F2EB">
            {caption_text}
          </text>
        </g>
        """)

    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
{bg_gradient}
{''.join(elements)}
</svg>"""

def generate_video_with_audio(aspect="16:9", out_path="public/videos/cgard_explainer_16x9.mp4", audio_wav="/tmp/full_narration.wav"):
    if aspect == "16:9":
        w, h = 1920, 1080
    else:
        w, h = 1080, 1920
        
    tmp_dir = f"/tmp/cgard_{aspect.replace(':','x')}"
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
    os.makedirs(tmp_dir, exist_ok=True)
    
    print(f"Generating {TOTAL_FRAMES} frames for {aspect} ({w}x{h})...")
    for idx in range(TOTAL_FRAMES):
        svg_content = render_svg_frame(idx, w, h, aspect)
        frame_file = os.path.join(tmp_dir, f"frame_{idx:04d}.svg")
        with open(frame_file, "w") as f:
            f.write(svg_content)
            
    print(f"Encoding {out_path} with video & AI audio...")
    cmd = [
        "ffmpeg", "-y",
        "-r", str(FPS),
        "-i", os.path.join(tmp_dir, "frame_%04d.svg"),
        "-i", audio_wav,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "fast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "128k",
        "-shortest",
        "-movflags", "+faststart",
        out_path
    ]
    subprocess.check_call(cmd, stderr=subprocess.DEVNULL)
    shutil.rmtree(tmp_dir)
    print(f"Done: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    os.makedirs("public/videos", exist_ok=True)
    generate_voiceover_audio()
    generate_video_with_audio("16:9", "public/videos/cgard_explainer_16x9.mp4")
    generate_video_with_audio("9:16", "public/videos/cgard_explainer_9x16.mp4")
