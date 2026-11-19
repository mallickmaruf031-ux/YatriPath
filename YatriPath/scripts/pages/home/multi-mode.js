'use strict';
/* MULTI MODE — Indian city/location dataset for the Multi Mode tab.
   Registers YP.multi so the existing wireCombo autocomplete works seamlessly.
   NO route planning, NO backend, NO real transport data — frontend placeholder only. */

(function () {
  /* Comprehensive Indian locations: cities, towns, state capitals across all 28 states + 8 UTs */
  const RAW = [
    // Andhra Pradesh
    ['Visakhapatnam','Andhra Pradesh'],['Vijayawada','Andhra Pradesh'],['Guntur','Andhra Pradesh'],
    ['Tirupati','Andhra Pradesh'],['Nellore','Andhra Pradesh'],['Rajahmundry','Andhra Pradesh'],
    ['Kakinada','Andhra Pradesh'],['Kurnool','Andhra Pradesh'],['Kadapa','Andhra Pradesh'],
    ['Anantapur','Andhra Pradesh'],['Eluru','Andhra Pradesh'],['Ongole','Andhra Pradesh'],
    ['Vizianagaram','Andhra Pradesh'],['Srikakulam','Andhra Pradesh'],['Chittoor','Andhra Pradesh'],
    ['Amaravati','Andhra Pradesh'],
    // Arunachal Pradesh
    ['Itanagar','Arunachal Pradesh'],['Naharlagun','Arunachal Pradesh'],['Pasighat','Arunachal Pradesh'],
    // Assam
    ['Guwahati','Assam'],['Silchar','Assam'],['Dibrugarh','Assam'],['Jorhat','Assam'],
    ['Nagaon','Assam'],['Tinsukia','Assam'],['Tezpur','Assam'],['Bongaigaon','Assam'],
    ['Dhubri','Assam'],['Diphu','Assam'],
    // Bihar
    ['Patna','Bihar'],['Gaya','Bihar'],['Bhagalpur','Bihar'],['Muzaffarpur','Bihar'],
    ['Purnia','Bihar'],['Darbhanga','Bihar'],['Bihar Sharif','Bihar'],['Ara','Bihar'],
    ['Begusarai','Bihar'],['Katihar','Bihar'],['Munger','Bihar'],['Chhapra','Bihar'],
    ['Sasaram','Bihar'],['Hajipur','Bihar'],['Siwan','Bihar'],
    // Chhattisgarh
    ['Raipur','Chhattisgarh'],['Bhilai','Chhattisgarh'],['Bilaspur','Chhattisgarh'],
    ['Korba','Chhattisgarh'],['Durg','Chhattisgarh'],['Rajnandgaon','Chhattisgarh'],
    ['Jagdalpur','Chhattisgarh'],['Raigarh','Chhattisgarh'],['Ambikapur','Chhattisgarh'],
    // Goa
    ['Panaji','Goa'],['Vasco da Gama','Goa'],['Madgaon','Goa'],['Mapusa','Goa'],['Ponda','Goa'],
    // Gujarat
    ['Ahmedabad','Gujarat'],['Surat','Gujarat'],['Vadodara','Gujarat'],['Rajkot','Gujarat'],
    ['Bhavnagar','Gujarat'],['Jamnagar','Gujarat'],['Junagadh','Gujarat'],['Gandhinagar','Gujarat'],
    ['Anand','Gujarat'],['Nadiad','Gujarat'],['Morbi','Gujarat'],['Surendranagar','Gujarat'],
    ['Bharuch','Gujarat'],['Mehsana','Gujarat'],['Bhuj','Gujarat'],['Vapi','Gujarat'],
    ['Navsari','Gujarat'],['Porbandar','Gujarat'],
    // Haryana
    ['Faridabad','Haryana'],['Gurgaon','Haryana'],['Panipat','Haryana'],['Ambala','Haryana'],
    ['Yamunanagar','Haryana'],['Rohtak','Haryana'],['Hisar','Haryana'],['Karnal','Haryana'],
    ['Sonipat','Haryana'],['Panchkula','Haryana'],['Bhiwani','Haryana'],['Sirsa','Haryana'],
    // Himachal Pradesh
    ['Shimla','Himachal Pradesh'],['Dharamsala','Himachal Pradesh'],['Solan','Himachal Pradesh'],
    ['Mandi','Himachal Pradesh'],['Baddi','Himachal Pradesh'],['Kullu','Himachal Pradesh'],
    ['Manali','Himachal Pradesh'],['Hamirpur','Himachal Pradesh'],['Bilaspur','Himachal Pradesh'],
    // Jharkhand
    ['Ranchi','Jharkhand'],['Jamshedpur','Jharkhand'],['Dhanbad','Jharkhand'],['Bokaro','Jharkhand'],
    ['Deoghar','Jharkhand'],['Hazaribagh','Jharkhand'],['Giridih','Jharkhand'],['Ramgarh','Jharkhand'],
    // Karnataka
    ['Bengaluru','Karnataka'],['Mysuru','Karnataka'],['Hubballi','Karnataka'],['Mangaluru','Karnataka'],
    ['Belagavi','Karnataka'],['Davanagere','Karnataka'],['Ballari','Karnataka'],['Vijayapura','Karnataka'],
    ['Shivamogga','Karnataka'],['Tumakuru','Karnataka'],['Raichur','Karnataka'],['Bidar','Karnataka'],
    ['Gulbarga','Karnataka'],['Hassan','Karnataka'],['Udupi','Karnataka'],['Chitradurga','Karnataka'],
    // Kerala
    ['Thiruvananthapuram','Kerala'],['Kochi','Kerala'],['Kozhikode','Kerala'],['Thrissur','Kerala'],
    ['Kollam','Kerala'],['Alappuzha','Kerala'],['Palakkad','Kerala'],['Kannur','Kerala'],
    ['Kasaragod','Kerala'],['Kottayam','Kerala'],['Idukki','Kerala'],['Malappuram','Kerala'],
    ['Wayanad','Kerala'],['Ernakulam','Kerala'],
    // Madhya Pradesh
    ['Bhopal','Madhya Pradesh'],['Indore','Madhya Pradesh'],['Gwalior','Madhya Pradesh'],
    ['Jabalpur','Madhya Pradesh'],['Ujjain','Madhya Pradesh'],['Sagar','Madhya Pradesh'],
    ['Dewas','Madhya Pradesh'],['Satna','Madhya Pradesh'],['Ratlam','Madhya Pradesh'],
    ['Rewa','Madhya Pradesh'],['Murwara','Madhya Pradesh'],['Singrauli','Madhya Pradesh'],
    ['Burhanpur','Madhya Pradesh'],['Itarsi','Madhya Pradesh'],
    // Maharashtra
    ['Mumbai','Maharashtra'],['Pune','Maharashtra'],['Nagpur','Maharashtra'],['Thane','Maharashtra'],
    ['Nashik','Maharashtra'],['Aurangabad','Maharashtra'],['Solapur','Maharashtra'],
    ['Kolhapur','Maharashtra'],['Navi Mumbai','Maharashtra'],['Amravati','Maharashtra'],
    ['Nanded','Maharashtra'],['Sangli','Maharashtra'],['Jalgaon','Maharashtra'],
    ['Akola','Maharashtra'],['Latur','Maharashtra'],['Dhule','Maharashtra'],['Ahmednagar','Maharashtra'],
    ['Chandrapur','Maharashtra'],['Parbhani','Maharashtra'],['Kalyan','Maharashtra'],
    ['Vasai','Maharashtra'],['Panvel','Maharashtra'],['Lonavala','Maharashtra'],
    // Manipur
    ['Imphal','Manipur'],['Thoubal','Manipur'],['Bishnupur','Manipur'],
    // Meghalaya
    ['Shillong','Meghalaya'],['Tura','Meghalaya'],['Jowai','Meghalaya'],
    // Mizoram
    ['Aizawl','Mizoram'],['Lunglei','Mizoram'],['Champhai','Mizoram'],
    // Nagaland
    ['Kohima','Nagaland'],['Dimapur','Nagaland'],['Mokokchung','Nagaland'],
    // Odisha
    ['Bhubaneswar','Odisha'],['Cuttack','Odisha'],['Rourkela','Odisha'],['Puri','Odisha'],
    ['Sambalpur','Odisha'],['Brahmapur','Odisha'],['Bargarh','Odisha'],['Balasore','Odisha'],
    ['Baripada','Odisha'],['Bhadrak','Odisha'],
    // Punjab
    ['Ludhiana','Punjab'],['Amritsar','Punjab'],['Jalandhar','Punjab'],['Patiala','Punjab'],
    ['Bathinda','Punjab'],['Pathankot','Punjab'],['Hoshiarpur','Punjab'],['Mohali','Punjab'],
    ['Gurdaspur','Punjab'],['Muktsar','Punjab'],
    // Rajasthan
    ['Jaipur','Rajasthan'],['Jodhpur','Rajasthan'],['Kota','Rajasthan'],['Bikaner','Rajasthan'],
    ['Ajmer','Rajasthan'],['Udaipur','Rajasthan'],['Bhilwara','Rajasthan'],['Alwar','Rajasthan'],
    ['Bharatpur','Rajasthan'],['Sikar','Rajasthan'],['Jaisalmer','Rajasthan'],
    ['Pali','Rajasthan'],['Hanumangarh','Rajasthan'],['Sri Ganganagar','Rajasthan'],
    ['Chittorgarh','Rajasthan'],['Pushkar','Rajasthan'],['Mount Abu','Rajasthan'],
    // Sikkim
    ['Gangtok','Sikkim'],['Namchi','Sikkim'],['Gyalshing','Sikkim'],
    // Tamil Nadu
    ['Chennai','Tamil Nadu'],['Coimbatore','Tamil Nadu'],['Madurai','Tamil Nadu'],
    ['Tiruchirappalli','Tamil Nadu'],['Salem','Tamil Nadu'],['Tirunelveli','Tamil Nadu'],
    ['Erode','Tamil Nadu'],['Vellore','Tamil Nadu'],['Thoothukudi','Tamil Nadu'],
    ['Tiruppur','Tamil Nadu'],['Dindigul','Tamil Nadu'],['Thanjavur','Tamil Nadu'],
    ['Ranipet','Tamil Nadu'],['Sivakasi','Tamil Nadu'],['Karur','Tamil Nadu'],
    ['Kanyakumari','Tamil Nadu'],['Rameswaram','Tamil Nadu'],['Ooty','Tamil Nadu'],
    ['Kodaikanal','Tamil Nadu'],['Puducherry','Tamil Nadu'],
    // Telangana
    ['Hyderabad','Telangana'],['Warangal','Telangana'],['Nizamabad','Telangana'],
    ['Khammam','Telangana'],['Karimnagar','Telangana'],['Ramagundam','Telangana'],
    ['Secunderabad','Telangana'],['Nalgonda','Telangana'],['Mahbubnagar','Telangana'],
    // Tripura
    ['Agartala','Tripura'],['Udaipur','Tripura'],['Dharmanagar','Tripura'],
    // Uttar Pradesh
    ['Lucknow','Uttar Pradesh'],['Kanpur','Uttar Pradesh'],['Agra','Uttar Pradesh'],
    ['Varanasi','Uttar Pradesh'],['Prayagraj','Uttar Pradesh'],['Meerut','Uttar Pradesh'],
    ['Ghaziabad','Uttar Pradesh'],['Noida','Uttar Pradesh'],['Gorakhpur','Uttar Pradesh'],
    ['Mathura','Uttar Pradesh'],['Bareilly','Uttar Pradesh'],['Aligarh','Uttar Pradesh'],
    ['Moradabad','Uttar Pradesh'],['Jhansi','Uttar Pradesh'],['Saharanpur','Uttar Pradesh'],
    ['Muzaffarnagar','Uttar Pradesh'],['Rampur','Uttar Pradesh'],['Shahjahanpur','Uttar Pradesh'],
    ['Firozabad','Uttar Pradesh'],['Lakhimpur','Uttar Pradesh'],['Hardoi','Uttar Pradesh'],
    ['Mirzapur','Uttar Pradesh'],['Sitapur','Uttar Pradesh'],['Faizabad','Uttar Pradesh'],
    ['Ayodhya','Uttar Pradesh'],['Vrindavan','Uttar Pradesh'],['Fatehpur Sikri','Uttar Pradesh'],
    // Uttarakhand
    ['Dehradun','Uttarakhand'],['Haridwar','Uttarakhand'],['Roorkee','Uttarakhand'],
    ['Haldwani','Uttarakhand'],['Rudrapur','Uttarakhand'],['Nainital','Uttarakhand'],
    ['Mussoorie','Uttarakhand'],['Rishikesh','Uttarakhand'],['Almora','Uttarakhand'],
    // West Bengal
    ['Kolkata','West Bengal'],['Howrah','West Bengal'],['Durgapur','West Bengal'],
    ['Asansol','West Bengal'],['Siliguri','West Bengal'],['Barddhaman','West Bengal'],
    ['Malda','West Bengal'],['Baharampur','West Bengal'],['Kharagpur','West Bengal'],
    ['Haldia','West Bengal'],['Jalpaiguri','West Bengal'],['Cooch Behar','West Bengal'],
    // Union Territories
    ['New Delhi','Delhi (NCT)'],['Delhi','Delhi (NCT)'],['Dwarka','Delhi (NCT)'],
    ['Chandigarh','Chandigarh'],
    ['Srinagar','Jammu and Kashmir'],['Jammu','Jammu and Kashmir'],
    ['Katra','Jammu and Kashmir'],['Baramulla','Jammu and Kashmir'],
    ['Leh','Ladakh'],['Kargil','Ladakh'],
    ['Port Blair','Andaman and Nicobar Islands'],
    ['Kavaratti','Lakshadweep'],
    ['Silvassa','Dadra and Nagar Haveli and Daman and Diu'],
    ['Daman','Dadra and Nagar Haveli and Daman and Diu'],
    ['Diu','Dadra and Nagar Haveli and Daman and Diu'],
    ['Puducherry','Puducherry'],['Karaikal','Puducherry'],['Mahe','Puducherry'],
  ];

  /* Build searchable location objects */
  const LOCS = RAW.map(([city, state]) => ({
    id: 'MM-' + city.toLowerCase().replace(/\s+/g, '-'),
    name: city + ', ' + state,
    short: city,
    city: city,
    region: state,
    code: '',
    type: 'City / Region',
  }));

  /* Register with YP as 'multi' transport mode */
  window.YP = window.YP || {};
  YP._multiLoaded = true;

  /* Minimal API surface that wireCombo expects */
  YP.loadMulti = function () {
    return Promise.resolve(LOCS);
  };

  /* Patch YP.load to handle 'multi' */
  const _origLoad = YP.load;
  YP.load = function (mode) {
    if (mode === 'multi') return YP.loadMulti();
    return _origLoad ? _origLoad.call(YP, mode) : Promise.reject(new Error('YP.load not ready'));
  };

  /* Patch YP.find to handle 'multi' */
  const _origFind = YP.find;
  YP.find = function (mode, q, limit, excludeId) {
    if (mode === 'multi') {
      const ql = (q || '').toLowerCase().trim();
      return LOCS
        .filter(l => l.id !== excludeId && (!ql || l.name.toLowerCase().includes(ql) || l.city.toLowerCase().includes(ql) || l.region.toLowerCase().includes(ql)))
        .slice(0, limit || 8);
    }
    return _origFind ? _origFind.call(YP, mode, q, limit, excludeId) : [];
  };
}());
