/**
 * Seed Cities and Locations
 * Malazone.com — Multi-City Data
 * © 2026 Malazone Technologies PLC
 */

USE malazone;

-- Clear existing locations
TRUNCATE TABLE locations;

-- Insert cities with their sub-zones
INSERT INTO locations (key_name, label_en, label_am, sub_zones, is_active, display_order) VALUES
('hawassa', 'Hawassa', 'ሐዋሳ', 
  JSON_ARRAY(
    JSON_OBJECT('key', 'tabor', 'label_en', 'Tabor', 'label_am', 'ታቦር'),
    JSON_OBJECT('key', 'lakefront', 'label_en', 'Lakefront', 'label_am', 'ሐይቅ ዳርቻ'),
    JSON_OBJECT('key', 'piassa', 'label_en', 'Piassa', 'label_am', 'ፒያሳ'),
    JSON_OBJECT('key', 'mehal_ketema', 'label_en', 'Mehal Ketema', 'label_am', 'መካል ከተማ'),
    JSON_OBJECT('key', 'tikur_ambesa', 'label_en', 'Tikur Ambesa', 'label_am', 'ጥቁር አምበሳ'),
    JSON_OBJECT('key', 'amora_gedel', 'label_en', 'Amora Gedel', 'label_am', 'አሞራ ገደል'),
    JSON_OBJECT('key', 'sabian', 'label_en', 'Sabian', 'label_am', 'ሳቢያን'),
    JSON_OBJECT('key', 'mille', 'label_en', 'Mille', 'label_am', 'ሚሌ')
  ),
  1, 1
),

('addis_ababa', 'Addis Ababa', 'አዲስ አበበ',
  JSON_ARRAY(
    JSON_OBJECT('key', 'bole', 'label_en', 'Bole', 'label_am', 'ቦሌ'),
    JSON_OBJECT('key', 'kazanchis', 'label_en', 'Kazanchis', 'label_am', 'ካዛንቺስ'),
    JSON_OBJECT('key', 'piassa', 'label_en', 'Piassa', 'label_am', 'ፒያሳ'),
    JSON_OBJECT('key', 'meskel_square', 'label_en', 'Meskel Square', 'label_am', 'መስቀል አደባባይ'),
    JSON_OBJECT('key', 'megenagna', 'label_en', 'Megenagna', 'label_am', 'መገናኛ'),
    JSON_OBJECT('key', 'bisrate_gabriel', 'label_en', 'Bisrate Gabriel', 'label_am', 'ቢስራተ ገብርኤኤል'),
    JSON_OBJECT('key', 'gerji', 'label_en', 'Gerji', 'label_am', 'ገርጂ'),
    JSON_OBJECT('key', 'bole_bulbula', 'label_en', 'Bole Bulbula', 'label_am', 'ቦሌ ቡልቡላ')
  ),
  0, 2
),

('yirgalem', 'Yirgalem', 'ይርጋለም',
  JSON_ARRAY(
    JSON_OBJECT('key', 'tabor', 'label_en', 'Tabor', 'label_am', 'ታቦር'),
    JSON_OBJECT('key', 'main_street', 'label_en', 'Main Street', 'label_am', 'ዋና መንገድ'),
    JSON_OBJECT('key', 'bus_station', 'label_en', 'Bus Station', 'label_am', 'የአውቶቡስ ጣቢያ'),
    JSON_OBJECT('key', 'market', 'label_en', 'Market', 'label_am', 'ገበታ')
  ),
  0, 3
),

('dilla', 'Dilla', 'ዲላ',
  JSON_ARRAY(
    JSON_OBJECT('key', 'center', 'label_en', 'Center', 'label_am', 'ማእከል'),
    JSON_OBJECT('key', 'bus_station', 'label_en', 'Bus Station', 'label_am', 'የአውቶቡስ ጣቢያ'),
    JSON_OBJECT('key', 'hospital_area', 'label_en', 'Hospital Area', 'label_am', 'የሆስፒታል አካባቢ')
  ),
  0, 4
),

('bensa', 'Bensa', 'በንሳ',
  JSON_ARRAY(
    JSON_OBJECT('key', 'piassa', 'label_en', 'Piassa', 'label_am', 'ፒያሳ'),
    JSON_OBJECT('key', 'main_road', 'label_en', 'Main Road', 'label_am', 'ዋና መንገድ')
  ),
  0, 5
),

('aleta_wondo', 'Aleta Wondo', 'አለታ ወንዶ',
  JSON_ARRAY(
    JSON_OBJECT('key', 'center', 'label_en', 'Center', 'label_am', 'ማእከል'),
    JSON_OBJECT('key', 'forest_area', 'label_en', 'Forest Area', 'label_am', 'የአረንጓዴ አካባቢ')
  ),
  0, 6
),

('chuko', 'Chuko', 'ጹኮ',
  JSON_ARRAY(
    JSON_OBJECT('key', 'center', 'label_en', 'Center', 'label_am', 'ማእከል'),
    JSON_OBJECT('key', 'market', 'label_en', 'Market', 'label_am', 'ገበታ')
  ),
  0, 7
);
