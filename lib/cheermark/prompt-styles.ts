/**
 * CheerMark comic-mode prompt style presets.
 * Switch `ACTIVE_COMIC_STYLE` to change the look of generated images.
 */

export type ComicStyleId =
  | "cute-game"       // active: Party Animals 3D soft plush toy style
  | "cute-game-v1"    // archive-1: Brawl Stars 2D cel-shaded outline style
  | "little-prince"   // Antoine de Saint-Exupéry watercolor storybook
  | "picture-book"    // Eric Carle / Jon Klassen children's book
  | "crayon"          // Crayola crayon / wobbly hand-drawn
  | "american-comic"; // Marvel / DC bold superhero comic

export const ACTIVE_COMIC_STYLE: ComicStyleId = "cute-game";

interface StyleContext {
  landmark: { name: string; city: string };
  winnerColors: string;
  colorTheme: string;
  effectDesc: string;
  scoreStr: string;
  slogan: string;
  moodDesc: string;
  winnerMascot: string;
}

export function buildComicPrompt(ctx: StyleContext): string {
  const { landmark, winnerColors, colorTheme, effectDesc, scoreStr, slogan, moodDesc, winnerMascot } = ctx;

  switch (ACTIVE_COMIC_STYLE) {

    case "cute-game":
      return [
        `Cheerful night scene with ${landmark.name} in ${landmark.city} as the glowing centerpiece.`,
        `${colorTheme}`,
        `The scoreline "${scoreStr}" projected in giant glowing ${winnerColors} numbers DIRECTLY ONTO the landmark facade.`,
        `The slogan "${slogan}" also inscribed in ${winnerColors} light on the building surface.`,
        `${effectDesc} radiating from the landmark.`,
        `In the lower foreground: 2 to 3 ${winnerMascot} characters rendered in the exact visual style of the game "Party Animals" —`,
        `fully 3D rendered, soft rounded body with NO hard edges, chubby barrel-shaped torso, stubby arms and legs, no visible neck,`,
        `ultra-soft plush fur or smooth matte silicone skin with subtle subsurface scattering and soft shadows,`,
        `NO ink outlines, NO cel-shading, NO 2D cartoon lines — purely smooth 3D surfaces like real plush toys,`,
        `small round glossy black eyes with a tiny white specular dot, simple cute closed or slightly open mouth,`,
        `calm but endearing facial expression, soft and huggable appearance,`,
        `each character the same size (about 10% of image height), wearing only a small ${winnerColors} fabric scarf,`,
        `each in a different pose: one at bottom-left with stubby arms raised, one at bottom-center looking up at the landmark, one at bottom-right tilting head with scarf blown sideways.`,
        `Slight depth offset between characters. Landmark dominates 75% of the frame above.`,
        `Mood: warm, cheerful, ${moodDesc}.`,
        `Render quality: high-end 3D animation studio, soft global illumination, Pixar/Party Animals production quality.`,
      ].join(" ");

    case "cute-game-v1":
      // Archive-1: Brawl Stars 2D cel-shaded outline style
      return [
        `Cheerful night scene illustration with ONE adorable mascot character in the foreground:`,
        `${landmark.name} in ${landmark.city} glowing with ${winnerColors} lights in the background — the architectural hero of the scene.`,
        `${colorTheme}`,
        `The scoreline "${scoreStr}" projected in giant glowing ${winnerColors} numbers DIRECTLY ONTO the landmark facade.`,
        `The slogan "${slogan}" also inscribed in ${winnerColors} light on the building surface.`,
        `${effectDesc} radiating from the landmark.`,
        `In the lower foreground: exactly 2 to 3 ${winnerMascot} chibi mascot characters,`,
        `each the same small size (about 10% of image height), chubby 2-head proportions, round body, stubby limbs,`,
        `drawn in Brawl Stars / Clash Royale stylized cartoon art — bold black ink outlines, flat cel-shading, sharp highlights,`,
        `big expressive anime eyes with shine, wide joyful mouths, exaggerated emotions, NOT plush or photorealistic.`,
        `Each mascot has a different pose — varied and lively, not a uniform row:`,
        `one at bottom-left jumping with fists in the air,`,
        `one at bottom-center leaning forward pointing up at the landmark score,`,
        `one at bottom-right doing a victory pose with scarf flying.`,
        `Each wears only a small ${winnerColors} scarf. Slight height offset between them for natural depth.`,
        `Landmark and light effects dominate 75% of the frame. Mascots are small cheerful accents only.`,
        `Mood: energetic, joyful, ${moodDesc}.`,
        `Style: mobile game card illustration, bold outlines, cel-shaded, vivid colors, NO photorealism.`,
      ].join(" ");

    case "little-prince":
      return [
        `Whimsical watercolor illustration in the style of "The Little Prince" by Antoine de Saint-Exupéry:`,
        `${landmark.name} in ${landmark.city} painted as a soft dreamy watercolor under a vast deep-blue night sky`,
        `filled with hand-painted golden stars and a large glowing moon.`,
        `${colorTheme}`,
        `The landmark radiates gentle ${winnerColors} watercolor washes of light, with delicate ${effectDesc}.`,
        `The football scoreline "${scoreStr}" written in elegant thin hand-lettered script, floating in the sky.`,
        `Slogan as a soft banner: "${slogan}".`,
        `Mood: poetic, tender, ${moodDesc}.`,
        `Style: loose expressive watercolor brushstrokes, soft bleed edges, muted yet luminous palette,`,
        `minimalist composition with large negative space, whimsical and dreamlike,`,
        `ink outlines are thin and sketchy, gouache highlights, vintage illustrated book quality,`,
        `NOT photorealistic, NOT manga, NOT American comic, NOT crayon, NOT digital-clean.`,
      ].join(" ");

    case "picture-book":
      return [
        `Charming children's picture book illustration, clean and polished digital art style, soft cel-shading, night scene:`,
        `${landmark.name} in ${landmark.city} under a deep blue starry night sky, illustrated in a warm storybook style.`,
        `${colorTheme}`,
        `The landmark glows beautifully with ${winnerColors} colored lights and ${effectDesc}.`,
        `The football scoreline "${scoreStr}" in a friendly rounded font inside a cheerful speech bubble.`,
        `Slogan: "${slogan}".`,
        `Mood: joyful, warm, ${moodDesc}.`,
        `Style: high-quality children's book illustration like Eric Carle or Jon Klassen,`,
        `clean smooth lines, soft color gradients, no rough textures, no crayon strokes, no wobbly lines,`,
        `gentle glow effects, polished digital painting, cute characters, friendly rounded architecture,`,
        `NOT realistic, NOT dark, NOT superhero, NOT manga, NOT crayon texture.`,
      ].join(" ");

    case "crayon":
      return [
        `Cute children's picture book illustration, crayon drawing style, soft waxy texture, gentle pastel tones at night:`,
        `${landmark.name} in ${landmark.city} drawn in a whimsical crayon storybook style under a starry night sky.`,
        `${colorTheme}`,
        `The landmark is warmly glowing with soft ${winnerColors} crayon-colored lights and ${effectDesc}.`,
        `The football scoreline "${scoreStr}" written in chunky rounded crayon lettering, like a child drew it.`,
        `Slogan in a cute speech bubble: "${slogan}".`,
        `Mood: cheerful, playful, ${moodDesc}.`,
        `Style: children's picture book, Crayola crayon texture, soft rounded shapes, no sharp edges,`,
        `wobbly hand-drawn lines, watercolor washes, pastel night sky with big round glowing stars,`,
        `cute and innocent aesthetic, NOT superhero, NOT manga, NOT realistic, NOT dark or gritty,`,
        `like an illustration from a Pixar storybook or a cheerful children's cartoon.`,
      ].join(" ");

    case "american-comic":
      return [
        `Nighttime comic book illustration, manga art style, bold ink outlines, flat cel-shading:`,
        `${landmark.name} in ${landmark.city} under a dark night sky, rendered as a cartoon illustration.`,
        `${colorTheme}`,
        `The landmark glows with ${winnerColors} colored lights against the black night sky.`,
        `The landmark is decorated with ${effectDesc}.`,
        `The football scoreline "${scoreStr}" in a bold comic speech bubble or graffiti lettering.`,
        `Slogan banner: "${slogan}".`,
        `Mood: ${moodDesc}.`,
        `Style: Japanese manga meets Western comic book, night scene with glowing neon ${winnerColors} lights,`,
        `halftone dot patterns, speed lines, thick black outlines, no photorealism, no photography,`,
        `purely illustrated, bold graphic novel aesthetic, 2D flat art, vibrant saturated colors.`,
      ].join(" ");
  }
}
