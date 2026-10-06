/**
 * Seed Cities and Locations
 * Malazone.com — Multi-City Data
 * Sprint 9b: label_sid (Sidaamu Afoo) added — machine transliterations,
 * PENDING NATIVE REVIEW.
 * © 2026 Malazone Technologies PLC
 */

USE malazone;

-- Clear existing locations
TRUNCATE TABLE locations;

-- Insert cities with their sub-zones
INSERT INTO locations (key_name, label_en, label_am, label_sid, sub_zones, is_active, display_order) VALUES
('hawassa', 'Hawassa', 'ሐዋሳ', 'Hawwissaa',
  JSON_ARRAY(
    JSON_OBJECT('key', 'tabor', 'label_en', 'Tabor', 'label_am', 'ታቦር', 'label_sid', 'Taabor'),
    JSON_OBJECT('key', 'lakefront', 'label_en', 'Lakefront', 'label_am', 'ሐይቅ ዳርቻ', 'label_sid', 'Haweela Daara'),
    JSON_OBJECT('key', 'piassa', 'label_en', 'Piassa', 'label_am', 'ፒያሳ', 'label_sid', 'Piyaasa'),
    JSON_OBJECT('key', 'mehal_ketema', 'label_en', 'Mehal Ketema', 'label_am', 'መካል ከተማ', 'label_sid', 'Mehaal Ketema'),
    JSON_OBJECT('key', 'tikur_ambesa', 'label_en', 'Tikur Ambesa', 'label_am', 'ጥቁር አምበሳ', 'label_sid', 'Tikur Aambesa'),
    JSON_OBJECT('key', 'amora_gedel', 'label_en', 'Amora Gedel', 'label_am', 'አሞራ ገደል', 'label_sid', 'Amora Geedel'),
    JSON_OBJECT('key', 'sabian', 'label_en', 'Sabian', 'label_am', 'ሳቢያን', 'label_sid', 'Saabiyan'),
    JSON_OBJECT('key', 'mille', 'label_en', 'Mille', 'label_am', 'ሚሌ', 'label_sid', 'Miile')
  ),
  1, 1
),

('addis_ababa', 'Addis Ababa', 'አዲስ አበበ', 'Addis Abbaa',
  JSON_ARRAY(
    JSON_OBJECT('key', 'bole', 'label_en', 'Bole', 'label_am', 'ቦሌ', 'label_sid', 'Boole'),
    JSON_OBJECT('key', 'kazanchis', 'label_en', 'Kazanchis', 'label_am', 'ካዛንቺስ', 'label_sid', 'Kaazanchis'),
    JSON_OBJECT('key', 'piassa', 'label_en', 'Piassa', 'label_am', 'ፒያሳ', 'label_sid', 'Piyaasa'),
    JSON_OBJECT('key', 'meskel_square', 'label_en', 'Meskel Square', 'label_am', 'መስቀል አደባባይ', 'label_sid', 'Mesikel Square'),
    JSON_OBJECT('key', 'megenagna', 'label_en', 'Megenagna', 'label_am', 'መገናኛ', 'label_sid', 'Meegenagna'),
    JSON_OBJECT('key', 'bisrate_gabriel', 'label_en', 'Bisrate Gabriel', 'label_am', 'ቢስራተ ገብርኤኤል', 'label_sid', 'Bisiraate Gabireel'),
    JSON_OBJECT('key', 'gerji', 'label_en', 'Gerji', 'label_am', 'ገርጂ', 'label_sid', 'Gerji'),
    JSON_OBJECT('key', 'bole_bulbula', 'label_en', 'Bole Bulbula', 'label_am', 'ቦሌ ቡልቡላ', 'label_sid', 'Boole Bulbula')
  ),
  0, 2
),

('yirgalem', 'Yirgalem', 'ይርጋለም', 'Yirgaaleem',
  JSON_ARRAY(
    JSON_OBJECT('key', 'tabor', 'label_en', 'Tabor', 'label_am', 'ታቦር', 'label_sid', 'Taabor'),
    JSON_OBJECT('key', 'main_street', 'label_en', 'Main Street', 'label_am', 'ዋና መንገድ', 'label_sid', 'Wana Meniged'),
    JSON_OBJECT('key', 'bus_station', 'label_en', 'Bus Station', 'label_am', 'የአውቶቡስ ጣቢያ', 'label_sid', 'Awtobus Taabiya'),
    JSON_OBJECT('key', 'market', 'label_en', 'Market', 'label_am', 'ገበታ', 'label_sid', 'Gebeta')
  ),
  0, 3
),

('dilla', 'Dilla', 'ዲላ', 'Diilla',
  JSON_ARRAY(
    JSON_OBJECT('key', 'center', 'label_en', 'Center', 'label_am', 'ማእከል', 'label_sid', 'Maakel'),
    JSON_OBJECT('key', 'bus_station', 'label_en', 'Bus Station', 'label_am', 'የአውቶቡስ ጣቢያ', 'label_sid', 'Awtobus Taabiya'),
    JSON_OBJECT('key', 'hospital_area', 'label_en', 'Hospital Area', 'label_am', 'የሆስፒታል አካባቢ', 'label_sid', 'Hospital Aakabaabi')
  ),
  0, 4
),

('bensa', 'Bensa', 'በንሳ', 'Bensaa/Daaye',
  JSON_ARRAY(
    JSON_OBJECT('key', 'piassa', 'label_en', 'Piassa', 'label_am', 'ፒያሳ', 'label_sid', 'Piyaasa'),
    JSON_OBJECT('key', 'main_road', 'label_en', 'Main Road', 'label_am', 'ዋና መንገድ', 'label_sid', 'Wana Meniged')
  ),
  0, 5
),

('aleta_wondo', 'Aleta Wondo', 'አለታ ወንዶ', 'Aletaa Wondoo',
  JSON_ARRAY(
    JSON_OBJECT('key', 'center', 'label_en', 'Center', 'label_am', 'ማእከል', 'label_sid', 'Maakel'),
    JSON_OBJECT('key', 'forest_area', 'label_en', 'Forest Area', 'label_am', 'የአረንጓዴ አካባቢ', 'label_sid', 'Arenjuwe Aakabaabi')
  ),
  0, 6
),

('chuko', 'Chuko', 'ጹኮ', 'Cuqoo',
  JSON_ARRAY(
    JSON_OBJECT('key', 'center', 'label_en', 'Center', 'label_am', 'ማእከል', 'label_sid', 'Maakel'),
    JSON_OBJECT('key', 'market', 'label_en', 'Market', 'label_am', 'ገበታ', 'label_sid', 'Gebeta')
  ),
  0, 7
);
