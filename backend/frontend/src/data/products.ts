export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: "valves" | "compressors" | "controls" | "piping" | "electrical";
  type?: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  specs: ProductSpec[];
}

const placeholder = (label: string) =>
  `https://placehold.co/600x450/f3f4f6/9ca3af?text=${encodeURIComponent(label)}`;

export const products: Product[] = [
  // ─── VALVES ────────────────────────────────────────────────────────────────
  {
    _id: "v-001",
    name: "Danfoss EVR 10 Solenoid Valve",
    brand: "Danfoss",
    category: "valves",
    type: "solenoid",
    price: 3850,
    stock: 42,
    description:
      "Direct-operated solenoid valve for liquid, suction, and hot-gas lines in refrigeration systems. NC type.",
    image: placeholder("EVR 10 Solenoid Valve"),
    specs: [
      { label: "Connection",    value: "⌀ 12 mm ODF"          },
      { label: "Max Pressure",  value: "46 bar"                },
      { label: "Coil Voltage",  value: "230 V AC / 24 V DC"   },
      { label: "Media",         value: "R404A, R134a, R22"     },
      { label: "Body Material", value: "Brass"                 },
    ],
  },
  {
    _id: "v-002",
    name: "Emerson ALCO Check Valve NRV 22",
    brand: "Emerson",
    category: "valves",
    type: "check",
    price: 2100,
    stock: 87,
    description:
      "Horizontal check valve preventing refrigerant backflow. Low opening differential pressure for efficient operation.",
    image: placeholder("ALCO Check Valve NRV 22"),
    specs: [
      { label: "Connection",    value: "⌀ 22 mm ODF"          },
      { label: "Max Pressure",  value: "32 bar"                },
      { label: "Opening ΔP",   value: "0.07 bar"              },
      { label: "Media",         value: "R404A, R507, R744"     },
      { label: "Body Material", value: "Brass"                 },
    ],
  },
  {
    _id: "v-003",
    name: "Honeywell DN25 Ball Valve V5013A",
    brand: "Honeywell",
    category: "valves",
    type: "ball",
    price: 1650,
    stock: 130,
    description:
      "Full-bore brass ball valve for refrigerant isolation. ISO 228 threaded ports. Suitable for chiller circuits.",
    image: placeholder("DN25 Ball Valve V5013A"),
    specs: [
      { label: "Size",           value: "DN25 (1 inch)"        },
      { label: "Max Pressure",   value: "40 bar"               },
      { label: "Temp Range",     value: "-30 °C to +120 °C"    },
      { label: "End Connection", value: "BSP threaded"         },
      { label: "Body Material",  value: "Forged Brass"         },
    ],
  },
  {
    _id: "v-004",
    name: "Danfoss AVTA Thermostatic Valve",
    brand: "Danfoss",
    category: "valves",
    type: "thermostatic",
    price: 6400,
    stock: 18,
    description:
      "Self-acting temperature regulating valve for water coolers and condensers. No external power required.",
    image: placeholder("AVTA Thermostatic Valve"),
    specs: [
      { label: "Setpoint Range", value: "+15 °C to +55 °C"    },
      { label: "Connection",     value: "DN20 flanged"         },
      { label: "Max Pressure",   value: "16 bar"               },
      { label: "Actuator",       value: "Liquid-filled element"},
      { label: "Body Material",  value: "Cast Iron"            },
    ],
  },
  {
    _id: "v-005",
    name: 'Parker Hannifin Gate Valve 2.5" ODF',
    brand: "Parker",
    category: "valves",
    type: "gate",
    price: 5200,
    stock: 25,
    description:
      "Forged brass rotolock gate valve for compressor service and isolation on large refrigeration systems.",
    image: placeholder("Gate Valve 2.5 ODF"),
    specs: [
      { label: "Connection",     value: "2.5 inch ODF"         },
      { label: "Max Pressure",   value: "34 bar"               },
      { label: "Stem",           value: "Packed, back-seating" },
      { label: "Media",          value: "R22, R134a, R404A, NH₃"},
      { label: "Body Material",  value: "Forged Brass"         },
    ],
  },

  // ─── CONTROLS ──────────────────────────────────────────────────────────────
  {
    _id: "c-001",
    name: "Danfoss AK-CC 550A Refrigeration Controller",
    brand: "Danfoss",
    category: "controls",
    type: "case-controller",
    price: 14500,
    stock: 11,
    description:
      "Case controller for supermarket refrigeration cases. Manages defrost, alarm, and door heating relay outputs.",
    image: placeholder("AK-CC 550A Controller"),
    specs: [
      { label: "Supply Voltage",  value: "230 V AC ±10%"       },
      { label: "Sensor Inputs",   value: "3 × NTC / PT1000"    },
      { label: "Relay Outputs",   value: "4 × 8 A"             },
      { label: "Communication",   value: "RS-485 MODBUS"       },
      { label: "Display",         value: "4-digit LED"         },
    ],
  },
  {
    _id: "c-002",
    name: "Emerson EC3-X33 Dixell Controller",
    brand: "Emerson",
    category: "controls",
    type: "temperature-controller",
    price: 8200,
    stock: 34,
    description:
      "Compact temperature controller for cold rooms and refrigerated display cabinets. HACCP alarm logging included.",
    image: placeholder("EC3-X33 Dixell Controller"),
    specs: [
      { label: "Supply Voltage", value: "230 V AC / 12–24 V"  },
      { label: "Probe Inputs",   value: "2 × NTC"             },
      { label: "Relay Outputs",  value: "3 × 16 A / 8 A"      },
      { label: "Display",        value: "3-digit LED, °C/°F"  },
      { label: "Protection",     value: "IP65 front panel"    },
    ],
  },
  {
    _id: "c-003",
    name: "Siemens LOGO! 8.3 PLC Module",
    brand: "Siemens",
    category: "controls",
    type: "plc",
    price: 22000,
    stock: 9,
    description:
      "Compact programmable logic controller for HVAC-R automation. Ethernet integrated with web server for remote monitoring.",
    image: placeholder("SIEMENS LOGO 8.3"),
    specs: [
      { label: "Supply Voltage",   value: "24 V DC"             },
      { label: "Digital Inputs",   value: "8 (4 × fast 5 kHz)"  },
      { label: "Digital Outputs",  value: "4 × relay 10 A"      },
      { label: "Communication",    value: "Ethernet, MODBUS TCP" },
      { label: "Memory",           value: "400 program blocks"   },
    ],
  },
  {
    _id: "c-004",
    name: "Honeywell UDC3200 PID Controller",
    brand: "Honeywell",
    category: "controls",
    type: "pid-controller",
    price: 18750,
    stock: 6,
    description:
      "DIN 96×96 mm universal PID controller for temperature and pressure loops. Auto-tune algorithm and ramp-soak profiler.",
    image: placeholder("UDC3200 PID Controller"),
    specs: [
      { label: "Input Types",    value: "TC, RTD, mV, mA, V"   },
      { label: "Output",         value: "4–20 mA / relay"       },
      { label: "Supply Voltage", value: "100–240 V AC"          },
      { label: "Display",        value: "0.56\" 5-digit LED"    },
      { label: "Communication",  value: "RS-485 MODBUS RTU"     },
    ],
  },
  {
    _id: "c-005",
    name: "Emerson Rosemount 3051 Pressure Transmitter",
    brand: "Emerson",
    category: "controls",
    type: "pressure-transmitter",
    price: 38500,
    stock: 4,
    description:
      "Smart differential pressure transmitter with HART protocol. Suitable for refrigerant pressure monitoring in industrial plants.",
    image: placeholder("Rosemount 3051 Transmitter"),
    specs: [
      { label: "Range",            value: "0–250 bar"              },
      { label: "Output",           value: "4–20 mA + HART"         },
      { label: "Accuracy",         value: "±0.04% URL"             },
      { label: "Supply Voltage",   value: "10.5–42.4 V DC"         },
      { label: "Wetted Material",  value: "316L SS / Hastelloy"    },
    ],
  },

  // ─── PIPING ────────────────────────────────────────────────────────────────
  {
    _id: "p-001",
    name: "Copper Refrigeration Tube — 22 mm × 1 mm",
    brand: "Mueller Industries",
    category: "piping",
    type: "tube",
    price: 980,
    stock: 320,
    description:
      "Seamless dehydrated copper tube in 5-metre straight lengths for refrigerant liquid and suction lines.",
    image: placeholder("Copper Tube 22mm"),
    specs: [
      { label: "OD",             value: "22 mm"                 },
      { label: "Wall Thickness", value: "1.0 mm"                },
      { label: "Length",         value: "5 m (straight)"        },
      { label: "Standard",       value: "EN 12735-1"            },
      { label: "Temper",         value: "Half-hard R250"        },
    ],
  },
  {
    _id: "p-002",
    name: "Swagelok SS-1210-1-12 Compression Fitting",
    brand: "Swagelok",
    category: "piping",
    type: "fitting",
    price: 1420,
    stock: 215,
    description:
      "316 stainless steel compression fitting for 19 mm OD tubing. Two-ferrule design for leak-tight seal in high-vibration systems.",
    image: placeholder("Swagelok Compression Fitting"),
    specs: [
      { label: "Tube OD",        value: "19 mm (3/4 inch)"      },
      { label: "Body Material",  value: "316 Stainless Steel"   },
      { label: "Max Pressure",   value: "413 bar"               },
      { label: "Temp Range",     value: "-65 °C to +230 °C"     },
      { label: "End Connection", value: 'Male NPT 3/4"'         },
    ],
  },
  {
    _id: "p-003",
    name: 'Victaulic Style 77 Flexible Coupling 2"',
    brand: "Victaulic",
    category: "piping",
    type: "coupling",
    price: 3200,
    stock: 58,
    description:
      "Flexible grooved pipe coupling for chilled water and secondary refrigerant systems. Accommodates vibration and angular deflection.",
    image: placeholder("Victaulic Style 77 Coupling"),
    specs: [
      { label: "Pipe Size",       value: "2 inch (DN50)"         },
      { label: "Pressure Rating", value: "12.1 bar"              },
      { label: "Housing Material",value: "Ductile Iron"          },
      { label: "Gasket",          value: "EPDM / Nitrile"        },
      { label: "Coating",         value: "Hot-dipped galvanised" },
    ],
  },
  {
    _id: "p-004",
    name: "Armacell AF/Armaflex Pipe Insulation — 28 mm",
    brand: "Armacell",
    category: "piping",
    type: "insulation",
    price: 650,
    stock: 480,
    description:
      "Closed-cell elastomeric foam insulation sleeve for cold suction lines. Prevents condensation and thermal loss.",
    image: placeholder("Armaflex Pipe Insulation 28mm"),
    specs: [
      { label: "Pipe OD",              value: "28 mm"                    },
      { label: "Wall Thickness",       value: "19 mm"                    },
      { label: "Length",               value: "2 m per piece"            },
      { label: "Thermal Conductivity", value: "0.033 W/m·K at 0 °C"     },
      { label: "Temp Range",           value: "-50 °C to +105 °C"        },
    ],
  },
  {
    _id: "p-005",
    name: "Weld-On Class 300 Raised-Face Flange DN40",
    brand: "Spirax Sarco",
    category: "piping",
    type: "flange",
    price: 2800,
    stock: 72,
    description:
      "Weld-neck raised-face flange in carbon steel for high-pressure refrigerant and process piping. ASME B16.5 rated.",
    image: placeholder("Weld-On Flange DN40"),
    specs: [
      { label: "Size",           value: "DN40 (1.5 inch)"        },
      { label: "Pressure Class", value: "ASME Class 300"         },
      { label: "Facing",         value: "Raised Face (RF)"       },
      { label: "Material",       value: "ASTM A105 Carbon Steel" },
      { label: "Standard",       value: "ASME B16.5"             },
    ],
  },

  // ─── ELECTRICAL ────────────────────────────────────────────────────────────
  {
    _id: "e-001",
    name: "Siemens 3RT2036 Contactor 50A",
    brand: "Siemens",
    category: "electrical",
    type: "contactor",
    price: 4600,
    stock: 29,
    description:
      "3-phase AC contactor for compressor motor switching in refrigeration plants. Integrated auxiliary contact block.",
    image: placeholder("Siemens 3RT2036 Contactor"),
    specs: [
      { label: "Rated Current", value: "50 A (AC-3)"            },
      { label: "Motor Power",   value: "22 kW at 400 V"         },
      { label: "Coil Voltage",  value: "230 V AC 50/60 Hz"      },
      { label: "Contacts",      value: "3NO + 1NO aux"          },
      { label: "Mounting",      value: "35 mm DIN rail"         },
    ],
  },
  {
    _id: "e-002",
    name: "ABB Tmax XT4 MCCB 160A",
    brand: "ABB",
    category: "electrical",
    type: "circuit-breaker",
    price: 12800,
    stock: 14,
    description:
      "Moulded case circuit breaker with thermal-magnetic trip for feeder and motor protection in industrial panels.",
    image: placeholder("ABB Tmax XT4 MCCB"),
    specs: [
      { label: "Rated Current",    value: "160 A"                },
      { label: "Breaking Capacity",value: "36 kA at 415 V"       },
      { label: "Poles",            value: "3P"                   },
      { label: "Trip Unit",        value: "Thermal-magnetic"     },
      { label: "Standard",         value: "IEC 60947-2"          },
    ],
  },
  {
    _id: "e-003",
    name: "Danfoss VLT HVAC Drive FC102 — 7.5 kW",
    brand: "Danfoss",
    category: "electrical",
    type: "vfd",
    price: 42000,
    stock: 5,
    description:
      "Variable frequency drive purpose-built for pumps, fans, and compressors in HVAC-R applications. Built-in EMC filter.",
    image: placeholder("Danfoss VLT FC102 7.5kW"),
    specs: [
      { label: "Power",          value: "7.5 kW / 10 HP"         },
      { label: "Input Voltage",  value: "380–480 V 3-phase"       },
      { label: "Output Current", value: "16 A"                    },
      { label: "Protection",     value: "IP20 / IP55 optional"    },
      { label: "Communication",  value: "PROFIBUS, MODBUS"        },
    ],
  },
  {
    _id: "e-004",
    name: "Siemens 3RU2136 Overload Relay 22–32A",
    brand: "Siemens",
    category: "electrical",
    type: "overload-relay",
    price: 3500,
    stock: 51,
    description:
      "Solid-state thermal overload relay with phase-loss detection for compressor motor protection. Manual/auto reset.",
    image: placeholder("Siemens 3RU2136 Overload Relay"),
    specs: [
      { label: "Setting Range", value: "22–32 A"                  },
      { label: "Phase Loss",    value: "Detected < 15 s"          },
      { label: "Trip Class",    value: "Class 10A"                },
      { label: "Contacts",      value: "1NC + 1NO"                },
      { label: "Mounting",      value: "Direct on 3RT20 contactors"},
    ],
  },
  {
    _id: "e-005",
    name: "Honeywell T6861 Room Thermostat",
    brand: "Honeywell",
    category: "electrical",
    type: "thermostat",
    price: 1850,
    stock: 93,
    description:
      "Fan coil unit room thermostat with LCD display. Controls 2-pipe or 4-pipe FCU systems in commercial buildings.",
    image: placeholder("Honeywell T6861 Thermostat"),
    specs: [
      { label: "Supply Voltage", value: "24 V AC"                 },
      { label: "Setpoint Range", value: "+5 °C to +35 °C"         },
      { label: "Output",         value: "3-speed fan + valve"     },
      { label: "Display",        value: "LCD with backlight"      },
      { label: "Protection",     value: "IP30"                    },
    ],
  },

  // ─── COMPRESSORS ───────────────────────────────────────────────────────────
  {
    _id: "co-001",
    name: "SMC CDQSB25-50DC Compact Cylinder",
    brand: "SMC",
    category: "compressors",
    type: "cylinder",
    price: 5800,
    stock: 37,
    description:
      "Short-stroke pneumatic cylinder with auto-switch rail for proximity sensing. Used in damper and valve actuator assemblies.",
    image: placeholder("SMC Compact Cylinder"),
    specs: [
      { label: "Bore Size",          value: "25 mm"               },
      { label: "Stroke",             value: "50 mm"               },
      { label: "Operating Pressure", value: "0.05–1.0 MPa"        },
      { label: "Port Size",          value: "M5"                  },
      { label: "Media",              value: "Filtered dry air"    },
    ],
  },
  {
    _id: "co-002",
    name: "Parker P3NFA-4 Air Filter Regulator",
    brand: "Parker",
    category: "compressors",
    type: "filter-regulator",
    price: 4100,
    stock: 62,
    description:
      "Combination filter-regulator with 40 μm bowl filter and manual drain. For air preparation ahead of pneumatic actuators.",
    image: placeholder("Parker Air Filter Regulator"),
    specs: [
      { label: "Port Size",     value: "1/2 inch BSP"            },
      { label: "Pressure Range",value: "0.5–10 bar"              },
      { label: "Filter Grade",  value: "40 μm"                   },
      { label: "Flow Rate",     value: "3,000 l/min at 6 bar"    },
      { label: "Bowl Material", value: "Polycarbonate"           },
    ],
  },
  {
    _id: "co-003",
    name: "Festo ADVU-32-80-PA Compact Cylinder",
    brand: "Festo",
    category: "compressors",
    type: "cylinder",
    price: 7200,
    stock: 20,
    description:
      "Double-acting compact cylinder with guided piston rod for high lateral-load applications. ATEX version available.",
    image: placeholder("Festo ADVU Compact Cylinder"),
    specs: [
      { label: "Bore Size",          value: "32 mm"               },
      { label: "Stroke",             value: "80 mm"               },
      { label: "Operating Pressure", value: "0.1–1.0 MPa"         },
      { label: "Cushioning",         value: "Both ends, adjustable"},
      { label: "Seal Material",      value: "NBR / PTFE"          },
    ],
  },
  {
    _id: "co-004",
    name: "SMC VQ1000 Solenoid Valve Manifold 5-Station",
    brand: "SMC",
    category: "compressors",
    type: "solenoid-manifold",
    price: 18500,
    stock: 8,
    description:
      "5-station solenoid valve manifold for centralised control of pneumatic actuators. Integrated digital I/O fieldbus.",
    image: placeholder("SMC VQ1000 Manifold"),
    specs: [
      { label: "Stations",      value: "5 (expandable to 16)"    },
      { label: "Valve Type",    value: "5/2 double solenoid"     },
      { label: "Coil Voltage",  value: "24 V DC"                 },
      { label: "Flow Rate",     value: "500 l/min (ANR) per valve"},
      { label: "Communication", value: "EtherNet/IP, PROFINET"   },
    ],
  },
  {
    _id: "co-005",
    name: 'Emerson Fisher 657 Diaphragm Actuator 3"',
    brand: "Emerson",
    category: "compressors",
    type: "actuator",
    price: 14200,
    stock: 13,
    description:
      "Spring-diaphragm pneumatic actuator for globe control valves. Fail-safe to seat on air failure. NACE trim available.",
    image: placeholder("Fisher 657 Diaphragm Actuator"),
    specs: [
      { label: "Diaphragm Size", value: "3 inch effective area"  },
      { label: "Air Supply",     value: "1.4–4.6 bar"            },
      { label: "Travel",         value: "38 mm (1.5 inch)"       },
      { label: "Fail Action",    value: "Fail-closed (FC)"       },
      { label: "Body Material",  value: "Cast Aluminium"         },
    ],
  },
]

export default products
