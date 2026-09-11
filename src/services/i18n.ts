import { SupportedLanguage } from '../types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  phases: {
    phase1: string;
    phase2: string;
    phase3: string;
    phase4: string;
    phase5: string;
    phase6: string;
  };
  personas: {
    sdma_ndma: string;
    pwd_official: string;
    transporter: string;
    field_officer: string;
    citizen: string;
    logistics_coord: string;
  };
  statuses: {
    open: string;
    at_risk: string;
    restricted: string;
    blocked: string;
    in_transit: string;
    delayed: string;
    arrived: string;
  };
  categories: {
    landslide: string;
    flood: string;
    road_damage: string;
    bridge_damage: string;
    congestion: string;
  };
  commodities: {
    medicine: string;
    food: string;
    construction: string;
    agriculture: string;
  };
  actions: {
    reportIncident: string;
    planRoute: string;
    simulateGps: string;
    syncQueue: string;
    offlineMode: string;
    onlineMode: string;
    aiBriefing: string;
    viewCorridors: string;
    overrideClosure: string;
    applyFilter: string;
  };
  alerts: {
    emergencyAlert: string;
    cautionAlert: string;
    weatherAdvisory: string;
    ivrPreviewText: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'NER Logistics & Accessibility Intelligence',
    appSubtitle: 'GIS & AI Disruption Senser for North Eastern Regional Corridors',
    phases: {
      phase1: 'Phase 1: GIS Base Graph',
      phase2: 'Phase 2: Field Reports & Offline',
      phase3: 'Phase 3: Predictive Risk Engine',
      phase4: 'Phase 4: Route Optimization',
      phase5: 'Phase 5: Fleet & Delivery Tracking',
      phase6: 'Phase 6: Executive Command Center'
    },
    personas: {
      sdma_ndma: 'SDMA / Disaster Command',
      pwd_official: 'PWD / NHIDCL Engineer',
      transporter: 'Transporter / Driver',
      field_officer: 'Field Officer / Volunteer',
      citizen: 'Citizen Resident',
      logistics_coord: 'Logistics Coordinator'
    },
    statuses: {
      open: 'Accessible (Open)',
      at_risk: 'High Disruption Risk',
      restricted: 'Restricted (4x4 / Light)',
      blocked: 'Blocked / Impassable',
      in_transit: 'In Transit',
      delayed: 'Delayed (>45 min)',
      arrived: 'Arrived at Destination'
    },
    categories: {
      landslide: 'Landslide / Rockfall',
      flood: 'Flash Flood / Waterlogging',
      road_damage: 'Road Subsidence / Erosion',
      bridge_damage: 'Bridge / Culvert Damage',
      congestion: 'Heavy Sludge & Congestion'
    },
    commodities: {
      medicine: 'Critical Medicines & Vaccines',
      food: 'PDS Grains & Food Ration',
      construction: 'Relief & Bailey Bridge Material',
      agriculture: 'Perishable Produce / Agri-Goods'
    },
    actions: {
      reportIncident: 'Submit Ground Report',
      planRoute: 'Calculate Safe Routes',
      simulateGps: 'Simulate Live GPS Ping',
      syncQueue: 'Sync Offline Queue',
      offlineMode: 'Offline Mode Active',
      onlineMode: 'Network Online (Connected)',
      aiBriefing: 'Generate AI Briefing',
      viewCorridors: 'Inspect Corridors',
      overrideClosure: 'Official Road Override',
      applyFilter: 'Filter Layers'
    },
    alerts: {
      emergencyAlert: 'CRITICAL HAZARD: Route impassable due to active debris flow.',
      cautionAlert: 'CAUTION: Single lane movement with reduced speeds.',
      weatherAdvisory: 'WEATHER WARNING: Intense rainfall detected by IMD Doppler radar.',
      ivrPreviewText: 'Voice IVR Broadcast: NH-10 is closed at 29th Mile. Transporters proceed via NH-717A.'
    }
  },
  as: {
    appTitle: 'উত্তৰ-পূৰ্বাঞ্চল পথ সুগমতা আৰু সামগ্ৰী পৰিবহণ প্লেটফৰ্ম',
    appSubtitle: 'বাস্তৱ সময়ৰ পথ পৰিস্থিতি আৰু পূৰ্বানুমান ব্যৱস্থা',
    phases: {
      phase1: 'পৰ্যায় ১: জিআইএছ মেপ',
      phase2: 'পৰ্যায় ২: ফিল্ড ৰিপৰ্ট আৰু অফলাইন',
      phase3: 'পৰ্যায় ৩: সম্ভাৱ্য বিঘ্নতা পূৰ্বানুমান',
      phase4: 'পৰ্যায় ৪: বিকল্প নিৰাপদ পথ',
      phase5: 'পৰ্যায় ৫: অত্যাৱশ্যকীয় সামগ্ৰী ট্ৰেকিং',
      phase6: 'পৰ্যায় ৬: চৰকাৰী মুখ্য নিয়ন্ত্ৰণ কক্ষ'
    },
    personas: {
      sdma_ndma: 'বিপৰ্যয় ব্যৱস্থাপনা (SDMA)',
      pwd_official: 'লোকনিৰ্মাণ বিভাগ (PWD)',
      transporter: 'পৰিবহণকাৰী / চালক',
      field_officer: 'ক্ষেত্ৰ বিষয়া / স্বেচ্ছাসেৱক',
      citizen: 'সাধাৰণ নাগৰিক',
      logistics_coord: 'যোগান শৃংখল সমন্বয়ক'
    },
    statuses: {
      open: 'খোলা আছে',
      at_risk: 'বিপদজনক অৱস্থা',
      restricted: 'সীমিত যাতায়াত',
      blocked: 'সম্পূৰ্ণ বন্ধ',
      in_transit: 'পথত চলি আছে',
      delayed: 'বিলম্বিত',
      arrived: 'গন্তব্যত উপস্থিত'
    },
    categories: {
      landslide: 'ভূমিস্খলন',
      flood: 'বানপানী / পানী জমা',
      road_damage: 'পথৰ ক্ষতি',
      bridge_damage: 'দলং ক্ষতিগ্ৰস্ত',
      congestion: 'যান-জঁট'
    },
    commodities: {
      medicine: 'জৰুৰী ঔষধ আৰু ভেকচিন',
      food: 'খাদ্য সামগ্ৰী / ৰেচন',
      construction: 'নিৰ্মাণ / বেইলী ব্ৰিজ সামগ্ৰী',
      agriculture: 'কৃষি উৎপাদন'
    },
    actions: {
      reportIncident: 'তথ্য প্ৰেৰণ কৰক',
      planRoute: 'বিকল্প পথ নিৰ্ধাৰণ',
      simulateGps: 'জিপিএছ পিং চিমুলেট',
      syncQueue: 'অফলাইন ছিংক কৰক',
      offlineMode: 'অফলাইন মোড সক্ৰিয়',
      onlineMode: 'অনলাইন (সংযুক্ত)',
      aiBriefing: 'AI পৰিস্থিতি প্ৰতিবেদন',
      viewCorridors: 'কৰিডৰ চাওক',
      overrideClosure: 'চৰকাৰী আদেশ',
      applyFilter: 'ফিল্টাৰ প্ৰয়োগ'
    },
    alerts: {
      emergencyAlert: 'জৰুৰী সতৰ্কতা: ভূমিস্খলনৰ বাবে পথ বন্ধ হৈছে।',
      cautionAlert: 'সাবধানতা: এখন লেনত যাতায়াত চলি আছে।',
      weatherAdvisory: 'বতৰ সতৰ্কতা: প্ৰবল বৰষুণৰ সম্ভাৱনা।',
      ivrPreviewText: 'ভইচ ক’ল বাৰ্তা: NH-10 ২৯ মাইলত বন্ধ। অনুগ্ৰহ কৰি NH-717A ব্যৱহাৰ কৰক।'
    }
  },
  bn: {
    appTitle: 'উত্তর-পূর্ব ভারত লজিস্টিকস ও রোড ইন্টেলিজেন্স প্ল্যাটফর্ম',
    appSubtitle: 'রিয়েল-টাইম রাস্তা পর্যবেক্ষণ ও এআই দুর্যোগ পূর্বাভাস ব্যবস্থা',
    phases: {
      phase1: 'ফেজ ১: জিআইএস বেস গ্রাফ',
      phase2: 'ফেজ ২: ফিল্ড রিপোর্ট ও অফলাইন সিঙ্ক',
      phase3: 'ফেজ ৩: এআই পূর্বাভাস ইঞ্জিন',
      phase4: 'ফেজ ৪: নিরাপদ বিকল্প রুট ও সতর্কতা',
      phase5: 'ফেজ ৫: জরুরি সরবরাহ ফ্লিট ট্র্যাকিং',
      phase6: 'ফেজ ৬: সরকারি কেন্দ্রীয় ড্যাশবোর্ড'
    },
    personas: {
      sdma_ndma: 'দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ',
      pwd_official: 'পিডব্লিউডি / এনএইচআইডিসিএল',
      transporter: 'ট্রান্সপোর্টার / চালক',
      field_officer: 'ফিল্ড অফিসার / স্বেচ্ছাসেবক',
      citizen: 'স্থানীয় বাসিন্দা',
      logistics_coord: 'সরবরাহ সমন্বয়কারী'
    },
    statuses: {
      open: 'চলাচল স্বাভাবিক',
      at_risk: 'উচ্চ ঝুঁকির সম্ভাবনা',
      restricted: 'সীমিত চলাচল',
      blocked: 'সম্পূর্ণ অবরুদ্ধ',
      in_transit: 'গাড়ী চলমান',
      delayed: 'বিলম্বিত',
      arrived: 'পৌঁছে গেছে'
    },
    categories: {
      landslide: 'ধস নেমেছে',
      flood: 'বন্যা / জলমগ্ন',
      road_damage: 'রাস্তা ধসে গেছে',
      bridge_damage: 'কালভার্ট ক্ষতিগ্রস্ত',
      congestion: 'ভারী যানজট'
    },
    commodities: {
      medicine: 'জরুরি ওষুধ ও ভ্যাকসিন',
      food: 'ত্রাণ ও খাদ্যশস্য',
      construction: 'নির্মাণ ও সেতু সামগ্রী',
      agriculture: 'কৃষি ও পচনশীল পণ্য'
    },
    actions: {
      reportIncident: 'ঘটনা রিপোর্ট করুন',
      planRoute: 'নিরাপদ রুট খুঁজুন',
      simulateGps: 'জিপিএস সিমুলেশন',
      syncQueue: 'অফলাইন রিপোর্ট সিঙ্ক',
      offlineMode: 'অফলাইন মোড',
      onlineMode: 'অনলাইন সংযুক্ত',
      aiBriefing: 'এআই পরিস্থিতি ব্রিফিং',
      viewCorridors: 'করিডোর দেখুন',
      overrideClosure: 'সরকারি রাস্তা নির্দেশ',
      applyFilter: 'ফিল্টার করুন'
    },
    alerts: {
      emergencyAlert: 'জরুরি সতর্কতা: ২৯ নম্বর মাইলে ধস পড়ার কারণে রাস্তা অবরুদ্ধ।',
      cautionAlert: 'সাবধানতা: সাবধানতার সাথে চালান, এক লেনে চলাচল।',
      weatherAdvisory: 'আবহাওয়া সতর্কতা: ভারী বৃষ্টির সম্ভাবনা।',
      ivrPreviewText: 'ভয়েস আইভিআর বার্তা: এনএইচ-১০ অবরুদ্ধ। অনুগ্রহ করে এনএইচ-৭১৭এ ব্যবহার করুন।'
    }
  },
  hi: {
    appTitle: 'पूर्वोत्तर क्षेत्र (NER) स्मार्ट लॉजिस्टिक्स एवं सड़क सुगमता मंच',
    appSubtitle: 'भू-स्थानिक (GIS) एवं AI संचालित वास्तविक-समय सड़क निगरानी एवं वैकल्पिक मार्ग प्रणाली',
    phases: {
      phase1: 'चरण 1: जीआईएस बेस नेटवर्क',
      phase2: 'चरण 2: फील्ड रिपोर्टिंग एवं ऑफलाइन सिंक',
      phase3: 'चरण 3: एआई व्यवधान पूर्वानुमान इंजन',
      phase4: 'चरण 4: सुरक्षित वैकल्पिक मार्ग एवं अलर्ट',
      phase5: 'चरण 5: आवश्यक सामग्री वाहन ट्रैकिंग',
      phase6: 'चरण 6: केंद्रीय आपदा एवं प्रशासनिक डैशबोर्ड'
    },
    personas: {
      sdma_ndma: 'आपदा प्रबंधन प्राधिकरण (SDMA)',
      pwd_official: 'पीडब्ल्यूडी / एनएचआईडीसीएल',
      transporter: 'ट्रांसपोर्टर / चालक',
      field_officer: 'फील्ड अधिकारी / वालंटियर',
      citizen: 'स्थानीय नागरिक',
      logistics_coord: 'सप्लाई चेन समन्वयक'
    },
    statuses: {
      open: 'मार्ग सुगम (खुला)',
      at_risk: 'अवरोध का उच्च जोखिम',
      restricted: 'प्रतिबंधित (हल्के वाहन केवल)',
      blocked: 'मार्ग पूर्णतः अवरुद्ध',
      in_transit: 'मार्ग में अग्रसर',
      delayed: 'विलंबित (>45 मिनट)',
      arrived: 'गंतव्य पर पहुंचा'
    },
    categories: {
      landslide: 'भूस्खलन / मलबा',
      flood: 'जलभराव / अचानक बाढ़',
      road_damage: 'सड़क धंसना / कटाव',
      bridge_damage: 'पुल / पुलिया क्षतिग्रस्त',
      congestion: 'कीचड़ एवं भीषण जाम'
    },
    commodities: {
      medicine: 'आपातकालीन दवाएं एवं वैक्सीन',
      food: 'पीडीएस राशन एवं खाद्यान्न',
      construction: 'राहत एवं बेली ब्रिज निर्माण सामग्री',
      agriculture: 'ताजा कृषि एवं बागवानी उत्पाद'
    },
    actions: {
      reportIncident: 'जमीनी रिपोर्ट भेजें',
      planRoute: 'सुरक्षित मार्ग खोजें',
      simulateGps: 'लाइव जीपीएस पिंग चलाएं',
      syncQueue: 'ऑफलाइन डेटा सिंक करें',
      offlineMode: 'ऑफलाइन मोड सक्रिय',
      onlineMode: 'नेटवर्क ऑनलाइन (सक्रिय)',
      aiBriefing: 'एआई आपदा ब्रीफिंग तैयार करें',
      viewCorridors: 'प्रमुख गलियारे देखें',
      overrideClosure: 'सड़क स्थिति आदेश',
      applyFilter: 'फ़िल्टर लागू करें'
    },
    alerts: {
      emergencyAlert: 'आपातकालीन अलर्ट: 29वें मील पर भारी भूस्खलन से मार्ग अवरुद्ध।',
      cautionAlert: 'सतर्कता अलर्ट: सोनापुर सुरंग के पास कीचड़, धीमी गति से चलें।',
      weatherAdvisory: 'मौसम चेतावनी: मौसम विभाग द्वारा भारी वर्षा का रेड अलर्ट।',
      ivrPreviewText: 'वॉयस कॉल (IVR): NH-10 अवरुद्ध है। सभी चालक NH-717A मार्ग का उपयोग करें।'
    }
  },
  kha: {
    appTitle: 'Ka Platform Pyniasoh bad Kit Jingbam ha Ri Shatei Lam Mihngi',
    appSubtitle: 'Ka jingpeit bniah ia ki surok bad ka jingsuk ban leit jingleit lyngba ka AI',
    phases: {
      phase1: 'Phase 1: GIS Surok',
      phase2: 'Phase 2: Ka Jingpyntip na ka Madan',
      phase3: 'Phase 3: Ka AI ban tip lypa ia ki jingeh',
      phase4: 'Phase 4: Ki Surok ba Shngain',
      phase5: 'Phase 5: Ka Jingbud ia ki Kali Kit Jingbam',
      phase6: 'Phase 6: Ka Dashboard jong ka Sorkar'
    },
    personas: {
      sdma_ndma: 'SDMA / Disaster Officer',
      pwd_official: 'PWD / NHIDCL Engineer',
      transporter: 'U Nongñiah Kali / Driver',
      field_officer: 'Field Officer / Volunteer',
      citizen: 'Uba Shong Shnong',
      logistics_coord: 'U Nongpyniaid Jingkit'
    },
    statuses: {
      open: 'Plie (Lah ban leit)',
      at_risk: 'Maan jingeh',
      restricted: 'Khyndiat kali',
      blocked: 'Khang Pyrkhing',
      in_transit: 'Dang ha lynti',
      delayed: 'Slem',
      arrived: 'Poi'
    },
    categories: {
      landslide: 'Jingtwad Khyndew',
      flood: 'Jingdap Um',
      road_damage: 'Pait ka Surok',
      bridge_damage: 'Pait Jingkieng',
      congestion: 'Sah Kut Kali'
    },
    commodities: {
      medicine: 'Dawai & Vaccines',
      food: 'Jingbam & Khaw',
      construction: 'Tiang Jingkieng',
      agriculture: 'Jingthung Jingtep'
    },
    actions: {
      reportIncident: 'Pyntip Jingjia',
      planRoute: 'Wad Lynti ba Shngain',
      simulateGps: 'Bud GPS',
      syncQueue: 'Pyniasoh Offline',
      offlineMode: 'Offline Mode',
      onlineMode: 'Online',
      aiBriefing: 'Jingbatai AI',
      viewCorridors: 'Peit Surok Bah',
      overrideClosure: 'Hukum Sorkar',
      applyFilter: 'Pynbeit'
    },
    alerts: {
      emergencyAlert: 'JINGMAHAM: Khang ka surok ha NH-10 namar ba twad khyndew.',
      cautionAlert: 'MAHAM: Iaid suki ha Sonapur namar ba dap ktieh.',
      weatherAdvisory: 'JINGMAHAM SLAP: U slap u jur bha katkum ka IMD.',
      ivrPreviewText: 'Kyntien ha ka Phone: Ka surok NH-10 ka la khang. Sngewbha pyndonkam da ka NH-717A.'
    }
  }
};
