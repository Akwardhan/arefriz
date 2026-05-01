require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // Valves
  { name: 'Ball Valve BV-250', category: 'valves', type: 'Ball Valve', brand: 'Danfoss', price: 145, stock: true, description: 'High-pressure ball valve for refrigeration systems', images: ['https://placehold.co/400x300?text=Ball+Valve'] },
  { name: 'Solenoid Valve EVR-6', category: 'valves', type: 'Solenoid Valve', brand: 'Danfoss', price: 210, stock: true, description: 'Normally closed solenoid valve for liquid lines', images: ['https://placehold.co/400x300?text=Solenoid+Valve'] },
  { name: 'Check Valve CV-22', category: 'valves', type: 'Check Valve', brand: 'Parker', price: 98, stock: false, description: 'Spring-loaded check valve for gas and liquid lines', images: ['https://placehold.co/400x300?text=Check+Valve'] },
  { name: 'Expansion Valve TXV-10', category: 'valves', type: 'Expansion Valve', brand: 'Emerson', price: 320, stock: true, description: 'Thermostatic expansion valve for HVAC systems', images: ['https://placehold.co/400x300?text=Expansion+Valve'] },
  { name: 'Relief Valve PRV-400', category: 'valves', type: 'Relief Valve', brand: 'Parker', price: 175, stock: true, description: 'Pressure relief valve rated at 400 PSI', images: ['https://placehold.co/400x300?text=Relief+Valve'] },

  // Compressors
  { name: 'Scroll Compressor SC-15', category: 'compressors', type: 'Scroll Compressor', brand: 'Emerson', price: 1850, stock: true, description: 'Copeland scroll compressor 15HP for commercial refrigeration', images: ['https://placehold.co/400x300?text=Scroll+Compressor'] },
  { name: 'Piston Compressor PC-5', category: 'compressors', type: 'Piston Compressor', brand: 'Danfoss', price: 980, stock: true, description: '5HP reciprocating compressor for light commercial use', images: ['https://placehold.co/400x300?text=Piston+Compressor'] },
  { name: 'Rotary Compressor RC-2', category: 'compressors', type: 'Rotary Compressor', brand: 'Emerson', price: 640, stock: false, description: '2HP rotary compressor for residential AC units', images: ['https://placehold.co/400x300?text=Rotary+Compressor'] },
  { name: 'Screw Compressor SRC-30', category: 'compressors', type: 'Screw Compressor', brand: 'Parker', price: 4200, stock: true, description: '30HP twin-screw compressor for industrial cooling', images: ['https://placehold.co/400x300?text=Screw+Compressor'] },
  { name: 'Inverter Compressor IC-10', category: 'compressors', type: 'Inverter Compressor', brand: 'Danfoss', price: 2300, stock: true, description: 'Variable speed inverter compressor 10HP', images: ['https://placehold.co/400x300?text=Inverter+Compressor'] },

  // Controls
  { name: 'Temperature Controller TC-100', category: 'controls', type: 'Temperature Controller', brand: 'Danfoss', price: 185, stock: true, description: 'Digital temperature controller with dual relay output', images: ['https://placehold.co/400x300?text=Temp+Controller'] },
  { name: 'Pressure Controller PC-50', category: 'controls', type: 'Pressure Controller', brand: 'Danfoss', price: 230, stock: true, description: 'Adjustable pressure controller for cut-in/cut-out', images: ['https://placehold.co/400x300?text=Pressure+Controller'] },
  { name: 'PLC Control Unit S7-200', category: 'controls', type: 'PLC', brand: 'Siemens', price: 1450, stock: true, description: 'Programmable logic controller for automation systems', images: ['https://placehold.co/400x300?text=PLC+Unit'] },
  { name: 'Thermostat EKC-201', category: 'controls', type: 'Thermostat', brand: 'Danfoss', price: 310, stock: false, description: 'Electronic refrigeration controller with HACCP logging', images: ['https://placehold.co/400x300?text=Thermostat'] },
  { name: 'Flow Controller FC-30', category: 'controls', type: 'Flow Controller', brand: 'Emerson', price: 540, stock: true, description: 'Mass flow controller for industrial gas regulation', images: ['https://placehold.co/400x300?text=Flow+Controller'] },

  // Piping
  { name: 'Copper Pipe 1/2" x 50ft', category: 'piping', type: 'Copper Pipe', brand: 'Parker', price: 95, stock: true, description: 'ACR copper tubing for refrigerant lines', images: ['https://placehold.co/400x300?text=Copper+Pipe'] },
  { name: 'Insulated Pipe 3/4" x 20ft', category: 'piping', type: 'Insulated Pipe', brand: 'Parker', price: 78, stock: true, description: 'Pre-insulated suction line pipe for split AC systems', images: ['https://placehold.co/400x300?text=Insulated+Pipe'] },
  { name: 'Pipe Elbow 90° 1"', category: 'piping', type: 'Elbow Fitting', brand: 'Parker', price: 22, stock: true, description: 'Brazed 90-degree elbow fitting for copper pipe', images: ['https://placehold.co/400x300?text=Pipe+Elbow'] },
  { name: 'Pipe Filter Drier FD-100', category: 'piping', type: 'Filter Drier', brand: 'Emerson', price: 55, stock: false, description: 'Bi-flow filter drier for moisture and acid removal', images: ['https://placehold.co/400x300?text=Filter+Drier'] },
  { name: 'Sight Glass SG-14', category: 'piping', type: 'Sight Glass', brand: 'Danfoss', price: 42, stock: true, description: 'Moisture indicator sight glass for liquid lines', images: ['https://placehold.co/400x300?text=Sight+Glass'] },

  // Electrical
  { name: 'Contactor 3P 25A', category: 'electrical', type: 'Contactor', brand: 'Siemens', price: 135, stock: true, description: '3-pole contactor 25A for compressor motor control', images: ['https://placehold.co/400x300?text=Contactor'] },
  { name: 'Circuit Breaker 32A', category: 'electrical', type: 'Circuit Breaker', brand: 'Siemens', price: 88, stock: true, description: 'MCB 32A single pole for HVAC circuit protection', images: ['https://placehold.co/400x300?text=Circuit+Breaker'] },
  { name: 'Motor Protection Relay MPR-20', category: 'electrical', type: 'Relay', brand: 'Siemens', price: 265, stock: true, description: 'Overload protection relay for 3-phase motors', images: ['https://placehold.co/400x300?text=Motor+Relay'] },
  { name: 'Capacitor 40uF 450V', category: 'electrical', type: 'Capacitor', brand: 'Emerson', price: 34, stock: false, description: 'Run capacitor for single-phase compressor motors', images: ['https://placehold.co/400x300?text=Capacitor'] },
  { name: 'Variable Frequency Drive VFD-5HP', category: 'electrical', type: 'VFD', brand: 'Siemens', price: 920, stock: true, description: '5HP variable frequency drive for motor speed control', images: ['https://placehold.co/400x300?text=VFD'] },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('25 products seeded successfully');
  process.exit(0);
}).catch(err => {
  console.error(err.message);
  process.exit(1);
});
