// Product Photography Map for ClaimGuard Registry
import alpecinImg from '../assets/images/alpecin_a3_1791578135196.jpg';
import bodyshopImg from '../assets/images/bodyshop_ginger_1791578105344.jpg';
import ducrayImg from '../assets/images/ducray_kelual_ds_1791578024765.jpg';
import eucerinImg from '../assets/images/eucerin_dermo_1791578062608.jpg';
import headShouldersImg from '../assets/images/head_shoulders_1791578262579.jpg';
import kerastaseImg from '../assets/images/kerastase_symbiose_1791578227641.jpg';
import elviveImg from '../assets/images/loreal_elvive_1791578196778.jpg';
import niveaImg from '../assets/images/nivea_anti_dandruff_1791578081754.jpg';
import schwarzkopfImg from '../assets/images/schwarzkopf_bonacure_1791578164043.jpg';
import vichyImg from '../assets/images/vichy_dercos_1791578299205.jpg';

export interface ProductPhotoInfo {
  slug: string;
  brand: string;
  product_name: string;
  image_url: string;
  volume: string;
  packaging_type: string;
  color_accent: string;
  badge_color: string;
  key_actives: string[];
}

export const PRODUCT_PHOTOS: Record<string, ProductPhotoInfo> = {
  pierrefabre_ducray: {
    slug: 'pierrefabre_ducray',
    brand: 'Ducray (Pierre Fabre)',
    product_name: 'Kelual DS Shampooing Traitant Antipelliculaire',
    image_url: ducrayImg,
    volume: '100 ml e',
    packaging_type: 'Dermo-cosmetic white clinical bottle with cobalt blue cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Ciclopirox Olamine 1%', 'Piroctone Olamine 0.75%', 'Keluamid (Acetamide MEA)'],
  },
  eucerin_dermocapillaire: {
    slug: 'eucerin_dermocapillaire',
    brand: 'Eucerin',
    product_name: 'DermoCapillaire Anti-Dandruff Gel Shampoo',
    image_url: eucerinImg,
    volume: '250 ml',
    packaging_type: 'White dermatological bottle with flip-top cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Climbazole', 'Piroctone Olamine', 'Polidocanol'],
  },
  nivea_anti_schuppen: {
    slug: 'nivea_anti_schuppen',
    brand: 'NIVEA MEN',
    product_name: 'Anti-Dandruff Power Shampoo (Active System)',
    image_url: niveaImg,
    volume: '250 ml e',
    packaging_type: 'Deep midnight blue ergonomic bottle',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Piroctone Olamine', 'Bamboo Extract', 'Menthol'],
  },
  bodyshop_ginger: {
    slug: 'bodyshop_ginger',
    brand: 'The Body Shop',
    product_name: 'Ginger Anti-Dandruff Scalp Care Shampoo',
    image_url: bodyshopImg,
    volume: '400 ml e 13.5 US FL OZ',
    packaging_type: 'Translucent amber bottle with botanical label',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Ginger Essential Oil', 'Birch Bark Extract', 'White Willow Bark'],
  },
  alpecin_a3: {
    slug: 'alpecin_a3',
    brand: 'Alpecin',
    product_name: 'Anti-Dandruff Shampoo A3 (Active Complex)',
    image_url: alpecinImg,
    volume: '250 ml e',
    packaging_type: 'Silver-grey industrial bottle with red crown cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Piroctone Olamine', 'Fumaric Acid', 'Caffeine Complex'],
  },
  schwarzkopf_bonacure: {
    slug: 'schwarzkopf_bonacure',
    brand: 'Schwarzkopf Professional',
    product_name: 'BC Bonacure Scalp Genesis Anti-Dandruff Shampoo',
    image_url: schwarzkopfImg,
    volume: '200 ml e 6.7 fl. oz.',
    packaging_type: 'Pearlescent white salon bottle with metallic cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['StemCode™ Complex', 'Vitamin E (Tocopheryl Acetate)', 'Zinc Pyrithione Alternative'],
  },
  loreal_elvive: {
    slug: 'loreal_elvive',
    brand: "L'Oréal Paris",
    product_name: 'Elvive Anti-Dandruff Balancing Shampoo',
    image_url: elviveImg,
    volume: '400 ml e',
    packaging_type: 'Turquoise curved bottle with gold cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Piroctone Olamine', 'Salicylic Acid', 'Scalp Balancing Complex'],
  },
  loreal_kerastase: {
    slug: 'loreal_kerastase',
    brand: 'Kérastase',
    product_name: 'Symbiose Bain Crème Anti-Pelliculaire',
    image_url: kerastaseImg,
    volume: '250 ml e 8.5 fl. oz.',
    packaging_type: 'Frosted milky-white luxury prism bottle with chrome cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Salicylic Acid', 'Piroctone Olamine', 'Bifidus Prebiotic'],
  },
  pg_headshoulders: {
    slug: 'pg_headshoulders',
    brand: 'Head & Shoulders',
    product_name: 'Classic Clean Anti-Dandruff Shampoo',
    image_url: headShouldersImg,
    volume: '400 ml e',
    packaging_type: 'Asymmetrical white bottle with iconic blue curved cap',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Piroctone Olamine (EU)', 'Pyrithione Zinc 1% (USA)', 'Zinc Carbonate'],
  },
  vichy_dercos: {
    slug: 'vichy_dercos',
    brand: 'Vichy Dercos',
    product_name: 'Dercos Technique Anti-Dandruff DS Treatment Shampoo',
    image_url: vichyImg,
    volume: '200 ml',
    packaging_type: 'Clinical white apothecary bottle with emerald green banner',
    color_accent: '#A87B4E',
    badge_color: 'bg-[#A87B4E]/20 text-[#F5F2EB] border-[#A87B4E]/40',
    key_actives: ['Selenium Disulfide 1%', 'Salicylic Acid', 'Ceramide R'],
  },
};

const ID_TO_SLUG_ALIAS: Record<string, string> = {
  prd_dcy_kds: 'pierrefabre_ducray',
  prd_eur_dca: 'eucerin_dermocapillaire',
  prd_nvm_adp: 'nivea_anti_schuppen',
  prd_tbs_gsc: 'bodyshop_ginger',
  prd_alp_a3: 'alpecin_a3',
  prd_sch_bc: 'schwarzkopf_bonacure',
  prd_ker_sym: 'loreal_kerastase',
  prd_vch_dds: 'vichy_dercos',
  prd_elv_adp: 'loreal_elvive',
  prd_hs_cc: 'pg_headshoulders',
};

export function getProductPhoto(slug?: string, brand?: string): ProductPhotoInfo {
  if (slug) {
    if (PRODUCT_PHOTOS[slug]) {
      return PRODUCT_PHOTOS[slug];
    }
    const aliased = ID_TO_SLUG_ALIAS[slug];
    if (aliased && PRODUCT_PHOTOS[aliased]) {
      return PRODUCT_PHOTOS[aliased];
    }
  }
  if (brand) {
    const brandLower = brand.toLowerCase();
    const found = Object.values(PRODUCT_PHOTOS).find((p) =>
      brandLower.includes(p.brand.toLowerCase()) || p.brand.toLowerCase().includes(brandLower)
    );
    if (found) return found;
  }
  return PRODUCT_PHOTOS.pierrefabre_ducray || Object.values(PRODUCT_PHOTOS)[0];
}
