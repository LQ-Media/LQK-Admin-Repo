const K_LAT=21.4225, K_LNG=39.8262;
const rad=x=>x*Math.PI/180, deg=x=>x*180/Math.PI;
const fix=a=>{a%=360;return a<0?a+360:a};
function qibla(lat,lng){
  const p1=rad(lat),p2=rad(K_LAT),dl=rad(K_LNG-lng);
  const y=Math.sin(dl)*Math.cos(p2);
  const x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return fix(deg(Math.atan2(y,x)));
}
const t=[
 ['Singapore',1.3521,103.8198,293],
 ['Kuala Lumpur',3.139,101.6869,292],
 ['Jakarta',-6.2088,106.8456,295],
 ['London',51.5074,-0.1278,119],
 ['New York',40.7128,-74.006,58],
 ['Sydney',-33.8688,151.2093,277],
 ['Istanbul',41.0082,28.9784,151],
 ['Cairo',30.0444,31.2357,136],
 ['Dubai',25.2048,55.2708,258],
 ['Toronto',43.6532,-79.3832,55],
 ['Johannesburg',-26.2041,28.0473,10],
 ['Karachi',24.8607,67.0011,267],
 ['Dhaka',23.8103,90.4125,278],
 ['Makkah',21.3891,39.8579,null],
];
for(const [n,la,lo,exp] of t){
  const b=qibla(la,lo);
  console.log(n.padEnd(14), b.toFixed(1).padStart(6)+'°', exp!==null?`(published ~${exp}° , diff ${Math.abs(b-exp).toFixed(1)})`:'(at the Kaaba)');
}
