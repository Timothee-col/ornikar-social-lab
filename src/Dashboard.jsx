import { useState, useMemo } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import _ from "lodash";

const DAILY=[["2026-01-01",1014097,1257.0,3351,174326,282,173],["2026-01-02",1047688,1297.0,3433,167772,347,201],["2026-01-03",1212206,1319.0,3965,206008,379,249],["2026-01-04",1288769,1353.0,4155,207898,463,291],["2026-01-05",1371425,1478.0,4291,291800,362,219],["2026-01-06",1604525,1703.0,5138,350141,335,181],["2026-01-07",1748962,2272.0,5250,349312,430,217],["2026-01-08",1960022,2539.0,5367,405165,435,223],["2026-01-09",1866733,2608.0,5136,393841,410,226],["2026-01-10",2144702,2983.0,6264,427644,561,294],["2026-01-11",2321803,2989.0,6702,433701,637,312],["2026-01-12",2270670,3000.0,6255,425810,615,331],["2026-01-13",1943493,2644.0,5144,375856,521,251],["2026-01-14",2007303,2569.0,5796,397125,507,267],["2026-01-15",1880964,2538.0,4969,389881,470,210],["2026-01-16",1956455,2661.0,5233,409417,427,213],["2026-01-17",1869816,2594.0,5161,386580,420,214],["2026-01-18",1892247,2472.0,5200,376999,456,230],["2026-01-19",1874164,2528.0,5212,374108,433,219],["2026-01-20",1607761,2360.0,4367,347133,401,209],["2026-01-21",1349880,1895.0,3783,295867,340,180],["2026-01-22",739910,1038.0,2032,168506,296,160],["2026-01-23",938211,1098.0,2315,209791,257,113],["2026-01-24",783251,1082.0,2083,160353,245,119],["2026-01-25",642289,792.0,1808,134888,57,28],["2026-01-26",693201,1209.0,2149,145583,263,141],["2026-01-27",450241,620.0,1321,95885,290,132],["2026-01-28",493210,652.0,1443,90551,254,114],["2026-01-29",382034,525.0,1092,71403,235,113],["2026-01-30",549690,610.0,1416,72143,227,92],["2026-01-31",515293,595.0,1367,90236,200,100],["2026-02-01",484418,568.0,1386,88135,206,103],["2026-02-02",790686,920.0,2116,136491,330,174],["2026-02-03",976738,1041.0,2641,169380,398,194],["2026-02-04",1210249,1282.0,3238,244645,447,218],["2026-02-05",1145573,1380.0,3155,223482,398,208],["2026-02-06",1656256,1654.0,4425,312464,412,192],["2026-02-07",1250902,1589.0,3550,229923,336,169],["2026-02-08",1149398,1668.0,3566,204844,394,207],["2026-02-09",1058477,1693.0,3467,199768,411,194],["2026-02-10",1054210,1583.0,3205,195493,356,174],["2026-02-11",1070690,1599.0,3335,204808,386,179],["2026-02-12",1202167,1729.0,3714,244222,349,182],["2026-02-13",696207,1070.0,2171,145979,220,121],["2026-02-14",801360,1141.0,2469,158343,230,112],["2026-02-15",805971,1211.0,2816,161585,303,164],["2026-02-16",654191,923.0,2256,119211,320,160],["2026-02-17",684819,890.0,2370,142557,253,121],["2026-02-18",721600,901.0,2448,146716,252,133],["2026-02-19",663271,875.0,2234,136544,224,122],["2026-02-20",390130,532.0,1322,78653,207,100],["2026-02-21",163528,229.0,724,41182,117,67],["2026-02-22",133182,209.0,592,31907,83,54],["2026-02-23",122633,170.0,485,28079,118,62],["2026-02-24",740852,1134.0,2051,127264,270,156],["2026-02-25",649510,1060.0,2042,138348,274,116],["2026-02-26",432359,783.0,1490,98934,214,108],["2026-02-27",596828,972.0,1756,125531,246,122],["2026-02-28",517763,894.0,1561,116561,186,89],["2026-03-01",492907,819.0,1629,105233,217,100],["2026-03-02",1350068,1943.0,4144,279145,349,159],["2026-03-03",1414762,2067.0,4448,273898,220,112],["2026-03-04",1953524,2825.0,5301,250746,370,195],["2026-03-05",1589689,2597.0,4374,221254,371,185],["2026-03-06",1676407,2679.0,4522,271192,365,191],["2026-03-07",1581193,2638.0,4493,251531,371,194],["2026-03-08",1640765,2667.0,5202,281514,389,185],["2026-03-09",1698803,2879.0,5398,298730,472,258],["2026-03-10",1883694,3078.0,6219,334263,506,251],["2026-03-11",1760727,3077.0,5898,316736,453,221],["2026-03-12",1208041,2056.0,4024,209289,362,196],["2026-03-13",1525689,2294.0,4435,260040,322,173],["2026-03-14",1234886,2254.0,3592,198206,321,158],["2026-03-15",1421344,2291.0,3958,203683,340,188],["2026-03-16",1257738,1886.0,3437,245469,396,185],["2026-03-17",1337495,1934.0,3606,213824,352,176],["2026-03-18",1125970,1727.0,3091,195505,328,152],["2026-03-19",928773,1604.0,3092,181442,304,151],["2026-03-20",986038,1592.0,3105,206716,271,117],["2026-03-21",909598,1553.0,2905,180905,308,148],["2026-03-22",1122364,1610.0,3799,232409,379,202],["2026-03-23",974003,1616.0,3068,191614,381,182],["2026-03-24",916598,1612.0,2845,173752,357,176],["2026-03-25",786943,1298.0,2318,141411,310,162],["2026-03-26",798764,1307.0,2279,138083,311,142],["2026-03-27",763820,1301.0,2126,133088,288,113],["2026-03-28",765754,1270.0,2423,121036,244,94],["2026-03-29",827602,1319.0,2569,131136,318,158],["2026-03-30",842242,1308.0,2427,129012,343,149],["2026-03-31",1314606,1913.0,3785,231015,381,171],["2026-04-01",1693796,2663.0,5350,300931,414,175],["2026-04-02",1512437,2660.0,4527,271022,413,178],["2026-04-03",2322723,3461.0,6699,405792,437,191],["2026-04-04",2061751,3414.0,6097,337794,439,202],["2026-04-05",2231497,3462.0,6646,347346,436,205],["2026-04-06",2186423,3465.0,6607,356006,443,207],["2026-04-07",1665227,2729.0,5137,287980,436,201],["2026-04-08",1768577,2720.0,5222,291787,422,191],["2026-04-09",1662041,2739.0,5028,272229,417,155],["2026-04-10",1409356,2289.0,4065,232964,384,161],["2026-04-11",1410857,2273.0,4148,215263,348,152],["2026-04-12",1575961,2307.0,4552,220894,445,193],["2026-04-13",1645306,2302.0,4537,221025,455,194],["2026-04-14",1592294,2278.0,4583,221951,438,195],["2026-04-15",1473975,2304.0,4144,199588,409,170],["2026-04-16",882525,1378.0,2620,140276,301,138],["2026-04-17",1334869,1875.0,3485,202756,270,128],["2026-04-18",1403173,1968.0,3807,207662,243,149],["2026-04-19",2014730,2554.0,4712,308418,292,184],["2026-04-20",1788391,2122.0,4195,239881,310,188],["2026-04-21",2927732,2655.0,6184,413745,320,218],["2026-04-22",1147347,1227.0,2656,142438,280,145],["2026-04-23",1569016,1480.0,3119,175228,239,127],["2026-04-24",1032673,1158.0,2343,121487,201,97],["2026-04-25",773156,879.0,2050,98759,207,93],["2026-04-26",775943,903.0,2134,92879,250,129],["2026-04-27",906001,977.0,2370,114459,245,107],["2026-04-28",610105,836.0,1736,86523,222,102],["2026-04-29",514970,717.0,1558,65400,220,92],["2026-04-30",444132,726.0,1236,54574,179,69],["2026-05-01",472608,726.0,1346,57660,163,71],["2026-05-02",425631,673.0,1209,55182,156,55],["2026-05-03",480766,706.0,1386,61200,211,91],["2026-05-04",1244464,2014.0,3500,201866,345,131],["2026-05-05",1489858,2509.0,4254,233297,395,167],["2026-05-06",1601498,2567.0,4815,245297,337,147],["2026-05-07",1301155,2339.0,3889,205140,322,128],["2026-05-08",1110301,1840.0,3093,164349,249,105],["2026-05-09",1211534,1988.0,3484,170082,278,111],["2026-05-10",1508640,2360.0,4311,191362,365,147],["2026-05-11",1232314,1920.0,3509,159104,312,122],["2026-05-12",1018290,1684.0,3010,133490,301,115],["2026-05-13",1113498,1825.0,3373,147385,266,113],["2026-05-14",1140007,2142.0,3265,184241,280,109],["2026-05-15",952349,1873.0,2778,149981,244,99],["2026-05-16",802509,1539.0,2381,123523,198,78],["2026-05-17",1168963,2117.0,3660,167721,299,142],["2026-05-18",1061906,2064.0,3036,153078,293,126],["2026-05-19",1102091,2096.0,3271,150875,312,117],["2026-05-20",1206386,2318.0,3501,175071,366,146],["2026-05-21",884901,1683.0,2431,127139,250,101],["2026-05-22",750849,1460.0,2075,108277,205,67],["2026-05-23",709371,1408.0,2198,93686,199,76],["2026-05-24",790219,1466.0,2493,98269,208,87],["2026-05-25",933594,1728.0,3018,119368,234,92],["2026-05-26",733365,1355.0,2966,79190,175,64],["2026-05-27",894113,1637.0,4085,157160,299,129],["2026-05-28",873069,1624.0,3938,213860,311,137],["2026-05-29",1233259,1976.0,6411,345275,365,192],["2026-05-30",1265477,1957.0,6554,313077,357,190],["2026-05-31",1217296,1903.0,5929,250635,381,202],["2026-06-01",1540634,2375.0,6433,355681,545,272],["2026-06-02",1536578,2372.0,5986,316921,369,164],["2026-06-03",1447408,2341.0,6583,365017,477,224],["2026-06-04",1143248,2257.0,4664,293579,330,161],["2026-06-05",1073450,2167.0,4184,258697,323,148],["2026-06-06",1105865,2011.0,4814,270386,290,143],["2026-06-07",1283624,2309.0,5551,265581,328,161],["2026-06-08",1293116,2324.0,5739,300162,397,201],["2026-06-09",1275426,2297.0,5702,292347,334,156],["2026-06-10",1622537,2834.0,7301,397637,349,147]];
const ADS=[{"ad":"SHORT_THEORY_9-16_Maman_Rebranded_WJftBKdQ.mp4","p":"Theory","r":"Short","f":"Micro-trottoir","co":"Testimonial","an":"Preuve sociale","ad2":"Preuve sociale","dp":"2026-01-20","dd":"2026-06-11","du":100,"v":"Maman","thumb":"maman","pd":{"7":[655521,2047.0,3042,103600,297,168],"15":[1037249,3192.0,4747,153040,501,293],"30":[3171278,7488.0,12480,454178,1110,602],"90":[13488207,22085.0,45930,1882195,3791,2107],"all":[14625238,23831.0,50216,2099669,4101,2297]},"pp":{"7":[255813,863.0,1181,33674,164,101],"15":[2134029,4296.0,7733,301138,609,309],"30":[5338094,6979.0,15943,689206,1324,705]}},{"ad":"SV_DRIVING_Micro2_9-16_Hook2_Rebranded_3CmWuhsx.mp4","p":"N/A","r":"N/A","f":"N/A","co":"N/A","an":"N/A","ad2":"N/A","dp":"2026-03-19","dd":"2026-05-29","du":72,"pd":{"15":[27204,61.0,96,3384,7,3],"30":[2532626,5080.0,7976,406712,619,247],"90":[16064835,26270.0,49091,2982630,3837,1715],"all":[16064835,26270.0,49091,2982630,3837,1715]},"pp":{"7":[5523,13.0,15,699,2,1],"15":[2505422,5019.0,7880,403328,612,244],"30":[6417654,8816.0,17371,1050715,1265,604]}},{"ad":"Envoie ça à un(e) ami(e) qui révise le code ! 💜 #permisdecon","p":"Theory","r":"Inhouse","f":"Screen recording","co":"UI Hack","an":"Bénéfice","ad2":"Réussite du code","dp":"2026-05-27","dd":"2026-06-11","du":16,"sa":"Réussite du code","v":"App Switcher","thumb":"app_switcher","pd":{"7":[1820373,3047.0,7781,418893,371,226],"15":[4912835,7176.0,22546,1308163,1233,780],"30":[4912835,7176.0,22546,1308163,1233,780],"90":[4912835,7176.0,22546,1308163,1233,780],"all":[4912835,7176.0,22546,1308163,1233,780]},"pp":{"7":[3091499,4128.0,14761,889031,861,554]}},{"ad":"La vie est plus belle avec le permis 🥰 Courage à tout le mon","p":"Driving","r":"Inhouse","f":"UGC","co":"Avant/Après","an":"Problème","ad2":"Galère de transport","dp":"2026-05-20","dd":"2026-06-11","du":23,"sa":"Galère de transport","v":"Quai Metro","thumb":"quai_metro","pd":{"7":[609003,1334.0,2094,169873,158,72],"15":[3173439,5474.0,14604,1026693,1077,474],"30":[3322299,5705.0,15475,1078942,1181,517],"90":[3322299,5705.0,15475,1078942,1181,517],"all":[3322299,5705.0,15475,1078942,1181,517]},"pp":{"7":[2299603,3737.0,10952,758755,796,344],"15":[148860,231.0,871,52249,104,43]}},{"ad":"Driving_Video_Inhouse_Dimitri_driving_ecran_metro_soleil_9-1","p":"Driving","r":"Inhouse","f":"UGC","co":"Avant/Après","an":"Problème","ad2":"Galère de transport","dp":"2026-06-01","dd":"2026-06-11","du":11,"sa":"Galère de transport","v":"Ecran RER","thumb":"ecran_rer","pd":{"7":[2299277,3635.0,10716,789107,685,314],"15":[2793233,4276.0,13641,990245,905,413],"30":[2793233,4276.0,13641,990245,905,413],"90":[2793233,4276.0,13641,990245,905,413],"all":[2793233,4276.0,13641,990245,905,413]},"pp":{"7":[493956,641.0,2925,201138,220,99]}},{"ad":"Copie de Theory_Getpov_pov-theory-0eur-9-16_K0jI3Jxv.mp4","p":"Theory","r":"Getpov","f":"UGC","co":"Testimonial","an":"Prix","ad2":"Prix","dp":"2026-04-29","dd":"2026-06-10","du":43,"v":"Zero euro","pd":{"7":[225383,356.0,397,24939,70,12],"15":[673332,1071.0,1314,66233,193,46],"30":[2449037,4076.0,5422,221965,620,194],"90":[2803234,4788.0,6368,247982,732,241],"all":[2803234,4788.0,6368,247982,732,241]},"pp":{"7":[321434,506.0,622,31253,89,24],"15":[1775705,3005.0,4108,155732,427,148],"30":[354197,712.0,946,26017,112,47]}},{"ad":"Image carousel 7","p":"Theory","r":"Inhouse","f":"Static","co":"Prix","an":"Prix","ad2":"Fil rouge","dp":"2026-01-30","dd":"2026-06-11","du":133,"sa":"Fil rouge","pd":{"7":[111322,260.0,1636,2,25,11],"15":[343002,712.0,4428,4,90,43],"30":[360196,740.0,4628,4,94,44],"90":[2144266,2846.0,8135,10,412,192],"all":[2314026,2957.0,8596,10,441,208]},"pp":{"7":[216118,405.0,2542,1,60,30],"15":[17194,28.0,200,0,4,1],"30":[1045538,1089.0,1578,2,159,70]}},{"ad":"Si toi aussi t'oses pas poser certaines questions, on y répo","p":"Driving","r":"Inhouse","f":"Pedago","co":"FAQ","an":"Autorité","ad2":"Autorité","dp":"2026-06-08","dd":"2026-06-11","du":4,"v":"Marjorie","pd":{"7":[780823,1252.0,4310,170257,169,87],"15":[780823,1252.0,4310,170257,169,87],"30":[780823,1252.0,4310,170257,169,87],"90":[780823,1252.0,4310,170257,169,87],"all":[780823,1252.0,4310,170257,169,87]},"pp":{}},{"ad":"Driving_Video_Inhouse_Caption_Metro_Soleil_Variation 3","p":"Driving","r":"Inhouse","f":"UGC","co":"Avant/Après","an":"Problème","ad2":"Galère de transport","dp":"2026-06-08","dd":"2026-06-11","du":4,"pd":{"7":[65474,80.0,266,18248,16,6],"15":[65474,80.0,266,18248,16,6],"30":[65474,80.0,266,18248,16,6],"90":[65474,80.0,266,18248,16,6],"all":[65474,80.0,266,18248,16,6]},"pp":{}},{"ad":"Image carousel 6","p":"Driving","r":"Inhouse","f":"Static","co":"Promo","an":"Prix","ad2":"Promo","dp":"2026-01-30","dd":"2026-06-11","du":133,"sa":"Promo","pd":{"7":[47039,92.0,716,0,16,6],"15":[330129,491.0,3754,0,68,22],"30":[416945,616.0,4670,0,77,26],"90":[425636,624.0,4707,0,79,27],"all":[993034,1271.0,6416,4,229,98]},"pp":{"7":[228665,320.0,2471,0,36,13],"15":[86816,125.0,916,0,9,4]}}];
const THUMBS={"app_switcher":"","maman":"","quai_metro":"","ecran_rer":""};
const LOGO_SRC="";

// ── PERIODS anchored to 2026-06-10 ──
const TODAY  = "2026-06-10";
const PK     = {"7":"7","15":"15","30":"30","90":"90","999":"all"};
const PRANGES = {
  "7":  ["2026-06-04","2026-06-10"],
  "15": ["2026-05-27","2026-06-10"],
  "30": ["2026-05-12","2026-06-10"],
  "90": ["2026-03-12","2026-06-10"],
  "all":["2026-01-01","2026-06-10"],
};
const PREV_RANGES = {
  "7":  ["2026-05-28","2026-06-03"],
  "15": ["2026-05-12","2026-05-26"],
  "30": ["2026-04-12","2026-05-11"],
};
const PREV_LABELS = {"7":"28/05→03/06","15":"12/05→26/05","30":"12/04→11/05"};
const PRESETS = [{l:"7J",d:7},{l:"15J",d:15},{l:"30J",d:30},{l:"90J",d:90},{l:"Tout",d:999}];

// ── FORMATTERS ──
const fN  = n => { if(n==null) return "–"; if(n>=1e6) return (n/1e6).toFixed(1)+"M"; if(n>=1e3) return (n/1e3).toFixed(1)+"k"; return Math.round(n).toLocaleString("fr-FR"); };
const fE  = n => n==null?"–":Math.round(n).toLocaleString("fr-FR")+" €";
const fP  = n => !n?"–":(n*100).toFixed(1)+"%";
const fP2 = n => n==null?"–":(n*100).toFixed(2)+"%";
const fC1 = n => !n?"–":n.toFixed(1)+" €";
const fDt = s => { if(!s)return""; const d=new Date(s); return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}); };

const prodTag = p => p==="Theory"?{bg:"#eef2ff",c:"#6366f1"}:p==="Driving"?{bg:"#ecfdf5",c:"#10b981"}:{bg:"#f5f5f5",c:"#999"};

function quantiles(arr){ const s=[...arr].filter(x=>x>0).sort((a,b)=>a-b); if(!s.length)return[0,0]; return[s[Math.floor(s.length*.25)]||0,s[Math.floor(s.length*.75)]||0]; }
function mfc(v,q25,q75,higher){ if(!v)return{}; if(higher){if(v>=q75)return{background:"#dcfce7",color:"#15803d"};if(v<=q25)return{background:"#fee2e2",color:"#b91c1c"};return{background:"#fef9c3",color:"#a16207"};} if(v<=q25)return{background:"#dcfce7",color:"#15803d"};if(v>=q75)return{background:"#fee2e2",color:"#b91c1c"};return{background:"#fef9c3",color:"#a16207"}; }
function ageC(d){ if(d<7)return{bg:"#dcfce7",c:"#15803d"};if(d<=30)return{bg:"#fef9c3",c:"#a16207"};return{bg:"#fee2e2",c:"#b91c1c"}; }

const aggArr = arrs => { const r=[0,0,0,0,0,0]; arrs.forEach(a=>{for(let i=0;i<6;i++)r[i]+=a[i];}); return r; };
const metrics = ([im,ct,cl,v2,ins,su]) => ({
  im,ct,cl,v2,ins,su,
  hr:im>0?v2/im:0, ctr:im>0?cl/im:0, ci:cl>0?ins/cl:0, cs:ins>0?su/ins:0,
  cpa:su>0?ct/su:0, cpm:im>0?ct/im*1000:0, cpc:cl>0?ct/cl:0,
});

const prevLabel = lbl => PREV_LABELS[lbl] || "";

// ── KPI CARD ──
function KPI({ label, mainStr, mainRaw, prevStr, prevRaw, inverse, children }) {
  const delta = prevRaw>0&&mainRaw>0 ? (mainRaw-prevRaw)/prevRaw : null;
  const good  = delta!==null ? (inverse?delta<0:delta>0) : null;
  return (
    <div style={{background:"#fff",borderRadius:12,padding:"13px 15px",border:"1px solid #e8e8e8",minWidth:0}}>
      <div style={{fontSize:9.5,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:"#111",fontVariantNumeric:"tabular-nums",lineHeight:1.1}}>
        {children || mainStr}
      </div>
      {delta!==null && (
        <div style={{marginTop:5,fontSize:9.5,color:"#bbb",lineHeight:1.4}}>
          <span>{prevLabel(label)}: </span>
          <span style={{fontWeight:700,color:"#999"}}>{prevStr}</span>
          <span style={{marginLeft:6,fontWeight:700,fontSize:10,color:good?"#16a34a":"#dc2626"}}>
            {delta>0?"+":""}{(delta*100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ── RANKING BLOCK ──
function Rank({ title, dim, data, metric, mLabel, mFmt, higher, color, bigAssets }) {
  const g={};
  data.forEach(d=>{
    const k=(d[dim]||"N/A")==="N/A"?"Non classé":d[dim];
    if(!g[k])g[k]={l:k,c:0,s:0,items:[]};
    g[k].items.push(d); g[k].c+=d._ct; g[k].s+=d._su;
  });
  const ranked=Object.values(g).map(x=>{
    const v=metric==="cpa"?(x.s>0?x.c/x.s:999):metric==="ct"?x.c:metric==="su"?x.s
      :x.items.reduce((a,d)=>a+(d["_"+metric]||0),0)/x.items.length;
    return{...x,v};
  }).sort((a,b)=>higher?b.v-a.v:a.v-b.v);
  const maxV=Math.max(...ranked.map(r=>r.v),1);
  const medals=["🥇","🥈","🥉"];
  return (
    <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #e5e5e5",minWidth:0}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:10,textTransform:"uppercase",letterSpacing:".05em",color:"#aaa",fontWeight:700}}>{title}</span>
        <span style={{fontSize:9,color,fontWeight:700,textTransform:"uppercase"}}>{mLabel}</span>
      </div>
      {ranked.slice(0,5).map((r,i)=>(
        <div key={i} style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
            <div>
              <span style={{fontSize:11,fontWeight:600,color:"#333"}}>{medals[i]||""} {r.l}</span>
              {bigAssets&&<span style={{fontSize:12,fontWeight:700,color:"#888",marginLeft:8}}>{r.items.length} assets</span>}
            </div>
            <span style={{fontSize:11,fontWeight:700,color,fontVariantNumeric:"tabular-nums"}}>{mFmt(r.v)}</span>
          </div>
          <div style={{height:3,background:"#f0f0f0",borderRadius:2,overflow:"hidden"}}>
            <div style={{width:Math.max(r.v/maxV*100,2)+"%",height:"100%",background:color,opacity:.45,borderRadius:2}}/>
          </div>
          {!bigAssets&&<div style={{fontSize:8.5,color:"#ccc",marginTop:1}}>{fE(r.c)} · {fN(r.s)} SU · {r.items.length} créas</div>}
          {bigAssets&&<div style={{fontSize:8.5,color:"#ccc",marginTop:1}}>{fE(r.c)} · {fN(r.s)} SU</div>}
        </div>
      ))}
    </div>
  );
}

// ── PRODUCT SPLIT BAR ──
function ProdSplit({ data, metric, fmt, label }) {
  const g={};let tot=0;
  data.forEach(d=>{const p=d.p==="N/A"?"Non classé":d.p;if(!g[p])g[p]=0;g[p]+=(d["_"+metric]||0);tot+=(d["_"+metric]||0);});
  const cols={Driving:"#10b981",Theory:"#6366f1","Non classé":"#d1d5db"};
  const items=Object.entries(g).sort((a,b)=>b[1]-a[1]);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <span style={{fontSize:9,color:"#bbb",fontWeight:700,textTransform:"uppercase",minWidth:36}}>{label}</span>
      <div style={{flex:1,display:"flex",height:6,borderRadius:3,overflow:"hidden",background:"#f0f0f0"}}>
        {items.map(([p,v],i)=><div key={i} style={{width:(v/Math.max(tot,1)*100)+"%",background:cols[p]||"#ccc",minWidth:v>0?2:0}}/>)}
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        {items.map(([p,v],i)=>(
          <span key={i} style={{fontSize:9.5,color:cols[p]||"#999",fontWeight:600,whiteSpace:"nowrap"}}>
            {p}: {fmt(v)}{tot>0?` (${(v/tot*100).toFixed(0)}%)`:""}</span>
        ))}
      </div>
    </div>
  );
}

// ── TOP ADS GRID ──
function TopAdsGrid({ ads, cpaQ, hrQ, csQ }) {
  const top = [...ads].filter(a=>a._ct>0).sort((a,b)=>b._ct-a._ct).slice(0,4);
  return (
    <div style={{marginBottom:22}}>
      <h2 style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 10px"}}>Top Ads</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
        {top.map((a,i)=>{
          const name = a.v ? `${a.r!=="N/A"?a.r+" – ":""}${a.v}` : a.ad.slice(0,30);
          const pt   = prodTag(a.p);
          const thumb= a.thumb ? THUMBS[a.thumb] : null;
          const spendMx = Math.max(...top.map(x=>x._ct),1);
          const cpaCx  = mfc(a._cpa, cpaQ[0], cpaQ[1], false);
          const hrCx   = mfc(a._hr,  hrQ[0],  hrQ[1],  true);
          const csCx   = mfc(a._cs,  csQ[0],  csQ[1],  true);
          return (
            <div key={i} style={{background:"#fff",borderRadius:14,border:"1px solid #ebebeb",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
              <div style={{position:"relative",height:148,overflow:"hidden",background:"#eee",flexShrink:0}}>
                {thumb
                  ? <img src={thumb} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#1a1a2e"}}><span style={{fontSize:28,opacity:.2}}>▶</span></div>
                }
                {a.url && (
                  <a href={a.url} target="_blank" rel="noopener noreferrer"
                    style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.88)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,.2)"}}>
                      <span style={{fontSize:14,marginLeft:3,color:"#222"}}>▶</span>
                    </div>
                  </a>
                )}
                <div style={{position:"absolute",top:7,left:7,display:"flex",gap:4,flexWrap:"wrap"}}>
                  <span style={{padding:"2px 7px",borderRadius:6,fontSize:9,fontWeight:700,background:pt.bg,color:pt.c,border:`1px solid ${pt.c}22`}}>
                    {a.p==="N/A"?"–":a.p}
                  </span>
                  {a.ad2!=="N/A"&&(
                    <span style={{padding:"2px 7px",borderRadius:6,fontSize:9,fontWeight:600,background:"rgba(0,0,0,.55)",color:"#fff"}}>
                      {a.ad2}
                    </span>
                  )}
                </div>
              </div>
              <div style={{padding:"10px 12px",flex:1}}>
                <div style={{fontSize:11.5,fontWeight:700,color:"#222",lineHeight:1.3,marginBottom:8}}>{name}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  <div style={{background:"#f8f8f8",borderRadius:7,padding:"5px 8px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:(a._ct/spendMx*100)+"%",background:"#e0e7ff",opacity:.5}}/>
                    <div style={{position:"relative"}}>
                      <div style={{fontSize:8.5,color:"#bbb",fontWeight:700,textTransform:"uppercase",letterSpacing:".04em"}}>Spend</div>
                      <div style={{fontSize:12,fontWeight:700,color:"#222",fontVariantNumeric:"tabular-nums"}}>{fE(a._ct)}</div>
                    </div>
                  </div>
                  <div style={{borderRadius:7,padding:"5px 8px",...(cpaCx.background?cpaCx:{background:"#f8f8f8"})}}>
                    <div style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:cpaCx.color||"#bbb"}}>CPA SU</div>
                    <div style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",color:cpaCx.color||"#222"}}>{fC1(a._cpa)}</div>
                  </div>
                  <div style={{borderRadius:7,padding:"5px 8px",...(hrCx.background?hrCx:{background:"#f8f8f8"})}}>
                    <div style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:hrCx.color||"#bbb"}}>Hook</div>
                    <div style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",color:hrCx.color||"#222"}}>{fP(a._hr)}</div>
                  </div>
                  <div style={{borderRadius:7,padding:"5px 8px",...(csCx.background?csCx:{background:"#f8f8f8"})}}>
                    <div style={{fontSize:8.5,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",color:csCx.color||"#bbb"}}>CVR SU/I</div>
                    <div style={{fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",color:csCx.color||"#222"}}>{fP(a._cs)}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// ── MAIN DASHBOARD ──
// ══════════════════════════════════════════════
export default function Dashboard() {
  const [preset,   setPreset]   = useState(15);
  const [filters,  setFilters]  = useState({});
  const [prodOn,   setProdOn]   = useState({Driving:true,Theory:true,"N/A":false});
  const [sortKey,  setSortKey]  = useState("_ct");
  const [sortDir,  setSortDir]  = useState("desc");
  const [chartM,   setChartM]   = useState("cpa");
  const [engM,     setEngM]     = useState("hr");
  const [rankM,    setRankM]    = useState("ct");
  const [expanded, setExpanded] = useState(null);

  const pk            = PK[String(preset)];
  const [pStart,pEnd] = PRANGES[pk];
  const prevRange     = PREV_RANGES[pk];
  const activeProd    = useMemo(()=>Object.entries(prodOn).filter(([,v])=>v).map(([k])=>k),[prodOn]);

  const adsInPeriod = useMemo(()=>
    ADS.filter(a=>a.pd[pk]&&activeProd.includes(a.p))
      .map(a=>{ const m=metrics(a.pd[pk]); return{...a,_im:m.im,_ct:m.ct,_cl:m.cl,_v2:m.v2,_ins:m.ins,_su:m.su,_hr:m.hr,_ctr:m.ctr,_ci:m.ci,_cs:m.cs,_cpa:m.cpa,_cpm:m.cpm,_cpc:m.cpc}; })
  ,[pk,activeProd]);

  const filteredAds = useMemo(()=>
    adsInPeriod.filter(d=>Object.entries(filters).every(([k,v])=>!v||d[k]===v))
  ,[adsInPeriod,filters]);

  const curTot = useMemo(()=>{
    const arrs=filteredAds.map(a=>a.pd[pk]).filter(Boolean);
    return arrs.length?metrics(aggArr(arrs)):metrics([0,0,0,0,0,0]);
  },[filteredAds,pk]);

  const prevTot = useMemo(()=>{
    if(!prevRange)return null;
    const arrs=ADS.filter(a=>a.pp?.[pk]&&activeProd.includes(a.p)&&Object.entries(filters).every(([k,v])=>!v||a[k]===v)).map(a=>a.pp[pk]);
    return arrs.length?metrics(aggArr(arrs)):null;
  },[prevRange,pk,activeProd,filters]);

  const totalAssets = adsInPeriod.length;

  const chartData = useMemo(()=>
    DAILY.filter(r=>r[0]>=pStart&&r[0]<=pEnd).map(r=>{
      const[d,im,ct,cl,v2,ins,su]=r;
      return{date:fDt(d),spend:ct,impr:im,
        cpa:su>0?ct/su:null, hr:im>0?v2/im:null, ctr:im>0?cl/im:null,
        cvrI:cl>0?ins/cl:null, cvrSU:ins>0?su/ins:null,
        cpm:im>0?ct/im*1000:null, cpc:cl>0?ct/cl:null};
    })
  ,[pStart,pEnd]);

  const sortedAds = useMemo(()=>_.orderBy(filteredAds.filter(a=>a._ct>0),[sortKey],[sortDir]),[filteredAds,sortKey,sortDir]);
  const maxCost   = useMemo(()=>Math.max(...sortedAds.map(a=>a._ct),1),[sortedAds]);

  const cpaQ = useMemo(()=>quantiles(sortedAds.map(a=>a._cpa)),[sortedAds]);
  const hrQ  = useMemo(()=>quantiles(sortedAds.filter(a=>a.f!=="Static").map(a=>a._hr)),[sortedAds]);
  const ctrQ = useMemo(()=>quantiles(sortedAds.filter(a=>a.f!=="Static").map(a=>a._ctr)),[sortedAds]);
  const ciQ  = useMemo(()=>quantiles(sortedAds.map(a=>a._ci)),[sortedAds]);
  const csQ  = useMemo(()=>quantiles(sortedAds.map(a=>a._cs)),[sortedAds]);
  const cpmQ = useMemo(()=>quantiles(sortedAds.map(a=>a._cpm)),[sortedAds]);

  const totC=sortedAds.reduce((s,a)=>s+a._ct,0), totSU=sortedAds.reduce((s,a)=>s+a._su,0);
  const totIM=sortedAds.reduce((s,a)=>s+a._im,0), totCL=sortedAds.reduce((s,a)=>s+a._cl,0);
  const totINS=sortedAds.reduce((s,a)=>s+a._ins,0), totV2=sortedAds.reduce((s,a)=>s+a._v2,0);

  const doSort = k=>{if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(k);setSortDir(["_cpa","_cpm","_cpc"].includes(k)?"asc":"desc");}};
  const Ar = ({k})=>sortKey===k?<span style={{marginLeft:2}}>{sortDir==="desc"?"▼":"▲"}</span>:null;

  const interval = Math.max(Math.floor(chartData.length/8),1);
  const CHART_OPTS=[{k:"cpa",l:"CPA SU"},{k:"cpc",l:"CPC"},{k:"cpm",l:"CPM"}];
  const ENG_OPTS=[{k:"hr",l:"Hook Rate"},{k:"ctr",l:"CTR"},{k:"cvrI",l:"CVR Inst"},{k:"cvrSU",l:"CVR SU/I"}];
  const RANK_OPTS=[{k:"ct",l:"Par Spend"},{k:"cpa",l:"Par CPA"},{k:"su",l:"Par Signup"}];

  const cs  ={padding:"5px 7px",borderBottom:"1px solid #f0f0f0",whiteSpace:"nowrap",fontSize:11,fontVariantNumeric:"tabular-nums"};
  const ths ={...cs,fontWeight:700,position:"sticky",top:0,background:"#fafafa",zIndex:2,cursor:"pointer",userSelect:"none",fontSize:9,textTransform:"uppercase",letterSpacing:".04em",color:"#aaa",textAlign:"right"};
  const thsL={...ths,textAlign:"left"};

  const adDisplayName = a => {
    const base = a.v ? a.v : a.ad.slice(0,28);
    const prefix = (a.r&&a.r!=="N/A") ? `${a.r} – ` : "";
    return prefix+base;
  };

  return (
    <div style={{fontFamily:"'Inter',-apple-system,system-ui,sans-serif",color:"#222",background:"#f6f6f7",minHeight:"100vh",padding:"20px 24px",maxWidth:1440,margin:"0 auto"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          {LOGO_SRC && <img src={LOGO_SRC} alt="Ornikar" style={{height:"52px",width:"52px",borderRadius:12,flexShrink:0}}/>}
          <div>
            <h1 style={{fontSize:20,fontWeight:800,margin:0,letterSpacing:"-.03em",color:"#111",lineHeight:1.1}}>
              Scorecard Creative Paid Social
            </h1>
            <p style={{color:"#bbb",fontSize:10.5,margin:"4px 0 0"}}>
              TikTok Ads · {fDt(pStart)} → {fDt(pEnd)} · <b style={{color:"#888"}}>{totalAssets}</b> assets sur la période
            </p>
          </div>
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
          {PRESETS.map(p=>(
            <button key={p.d} onClick={()=>setPreset(p.d)}
              style={{padding:"5px 13px",borderRadius:8,border:preset===p.d?"2px solid #6366f1":"1px solid #ddd",background:preset===p.d?"#eef2ff":"#fff",color:preset===p.d?"#6366f1":"#888",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .1s"}}>
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        {["Driving","Theory","N/A"].map(p=>{
          const on=prodOn[p]; const t=prodTag(p);
          return (
            <button key={p} onClick={()=>setProdOn(s=>({...s,[p]:!s[p]}))}
              style={{padding:"4px 13px",borderRadius:20,border:on?`2px solid ${t.c}`:"1px solid #e0e0e0",background:on?t.bg:"#fff",color:on?t.c:"#ccc",fontSize:11,fontWeight:700,cursor:"pointer",opacity:on?1:.5,transition:"all .15s"}}>
              {p==="N/A"?"Non classé":p}
            </button>
          );
        })}
        <div style={{flex:1}}/>
        {["an","r","f","co"].map(d=>(
          <select key={d} value={filters[d]||""} onChange={e=>setFilters(f=>({...f,[d]:e.target.value}))}
            style={{background:"#fff",color:"#555",border:"1px solid #ddd",borderRadius:8,padding:"4px 10px",fontSize:10.5,outline:"none"}}>
            <option value="">{{an:"Angle",r:"Réalisation",f:"Format",co:"Concept"}[d]}</option>
            {[...new Set(adsInPeriod.map(a=>a[d]).filter(x=>x&&x!=="N/A"))].sort().map(v=><option key={v} value={v}>{v}</option>)}
          </select>
        ))}
        {Object.values(filters).some(Boolean)&&(
          <button onClick={()=>setFilters({})} style={{background:"none",color:"#6366f1",border:"none",cursor:"pointer",fontSize:10.5,fontWeight:700}}>✕ Reset</button>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:20}}>
        <div style={{background:"#fff",borderRadius:12,padding:"13px 15px",border:"1px solid #e8e8e8"}}>
          <div style={{fontSize:9.5,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",fontWeight:700,marginBottom:4}}>Assets</div>
          <div style={{fontSize:22,fontWeight:800,color:"#111"}}>{totalAssets}</div>
        </div>
        <KPI label="Spend"    mainStr={fE(curTot.ct)}   mainRaw={curTot.ct}   prevStr={prevTot?fE(prevTot.ct):"–"}    prevRaw={prevTot?.ct||0}   inverse={false}/>
        <KPI label="Signups"  mainStr={fN(curTot.su)}   mainRaw={curTot.su}   prevStr={prevTot?fN(prevTot.su):"–"}    prevRaw={prevTot?.su||0}   inverse={false}/>
        <KPI label="CPA SU"   mainStr={fC1(curTot.cpa)} mainRaw={curTot.cpa}  prevStr={prevTot?fC1(prevTot.cpa):"–"} prevRaw={prevTot?.cpa||0}  inverse={true}/>
        <KPI label="Hook Rate" mainStr={fP(curTot.hr)}  mainRaw={curTot.hr}   prevStr={prevTot?fP(prevTot.hr):"–"}   prevRaw={prevTot?.hr||0}   inverse={false}/>
        <KPI label="CTR"      mainStr={fP2(curTot.ctr)} mainRaw={curTot.ctr}  prevStr={prevTot?fP2(prevTot.ctr):"–"} prevRaw={prevTot?.ctr||0}  inverse={false}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
        <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #e8e8e8"}}>
          <ProdSplit data={filteredAds} metric="ct" fmt={fE} label="Spend"/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7,marginTop:10}}>
            <span style={{fontSize:10.5,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em"}}>Spend & Efficiency</span>
            <div style={{display:"flex",gap:3}}>
              {CHART_OPTS.map(o=>(
                <button key={o.k} onClick={()=>setChartM(o.k)}
                  style={{padding:"2px 7px",borderRadius:6,border:chartM===o.k?"1px solid #6366f1":"1px solid #e0e0e0",background:chartM===o.k?"#eef2ff":"#fff",color:chartM===o.k?"#6366f1":"#ccc",fontSize:9.5,fontWeight:600,cursor:"pointer"}}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:8.5,fill:"#ccc"}} interval={interval}/>
              <YAxis yAxisId="l" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>v>=1000?(v/1000).toFixed(0)+"k":v}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>v.toFixed(0)+"€"}/>
              <Tooltip contentStyle={{fontSize:10,borderRadius:8,border:"1px solid #eee"}} formatter={(v,n)=>[typeof v==="number"?(v>=100?fN(v):v.toFixed(2)):v,n]}/>
              <Bar yAxisId="l" dataKey="spend" name="Spend (€)" fill="#c7d2fe" radius={[2,2,0,0]}/>
              <Line yAxisId="r" dataKey={chartM} name={CHART_OPTS.find(o=>o.k===chartM)?.l} stroke="#6366f1" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #e8e8e8"}}>
          <ProdSplit data={filteredAds} metric="im" fmt={fN} label="Impr."/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7,marginTop:10}}>
            <span style={{fontSize:10.5,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".05em"}}>Impr. & Engagement</span>
            <div style={{display:"flex",gap:3}}>
              {ENG_OPTS.map(o=>(
                <button key={o.k} onClick={()=>setEngM(o.k)}
                  style={{padding:"2px 7px",borderRadius:6,border:engM===o.k?"1px solid #10b981":"1px solid #e0e0e0",background:engM===o.k?"#ecfdf5":"#fff",color:engM===o.k?"#10b981":"#ccc",fontSize:9.5,fontWeight:600,cursor:"pointer"}}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{fontSize:8.5,fill:"#ccc"}} interval={interval}/>
              <YAxis yAxisId="l" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1e3?(v/1e3).toFixed(0)+"k":v}/>
              <YAxis yAxisId="r" orientation="right" tick={{fontSize:8.5,fill:"#ccc"}} tickFormatter={v=>(v*100).toFixed(1)+"%"}/>
              <Tooltip contentStyle={{fontSize:10,borderRadius:8,border:"1px solid #eee"}} formatter={(v,n)=>[typeof v==="number"?(v<1?(v*100).toFixed(2)+"%":fN(v)):v,n]}/>
              <Bar yAxisId="l" dataKey="impr" name="Impressions" fill="#d1fae5" radius={[2,2,0,0]}/>
              <Line yAxisId="r" dataKey={engM} name={ENG_OPTS.find(o=>o.k===engM)?.l} stroke="#10b981" strokeWidth={2} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TopAdsGrid ads={filteredAds} cpaQ={cpaQ} hrQ={hrQ} csQ={csQ}/>

      <div style={{marginBottom:22}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <h2 style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",margin:0}}>Top Performers par segment</h2>
          <div style={{display:"flex",gap:4}}>
            {RANK_OPTS.map(o=>(
              <button key={o.k} onClick={()=>setRankM(o.k)}
                style={{padding:"3px 10px",borderRadius:7,border:rankM===o.k?"1px solid #6366f1":"1px solid #ddd",background:rankM===o.k?"#eef2ff":"#fff",color:rankM===o.k?"#6366f1":"#aaa",fontSize:10,fontWeight:600,cursor:"pointer"}}>
                {o.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:8}}>
          {[
            {d:"p",  t:"Produit", big:true},
            {d:"ad2",t:"Angle"},
            {d:"co", t:"Concept"},
            {d:"f",  t:"Format"},
          ].map(({d,t,big})=>(
            <Rank key={d} title={t} dim={d} data={filteredAds}
              metric={rankM} mLabel={rankM==="ct"?"Spend":rankM==="cpa"?"CPA SU":"Signups"}
              mFmt={rankM==="ct"?fE:rankM==="cpa"?fC1:fN}
              higher={rankM!=="cpa"} color={rankM==="ct"?"#818cf8":rankM==="cpa"?"#f59e0b":"#10b981"}
              bigAssets={big}/>
          ))}
        </div>
      </div>

      <h2 style={{fontSize:12,fontWeight:700,color:"#aaa",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Deep Dive Créas</h2>
      <div style={{overflowX:"auto",borderRadius:12,border:"1px solid #e5e5e5",background:"#fff"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:1050}}>
          <thead>
            <tr>
              <th style={{...thsL,minWidth:220}}>Créa / Segmentation</th>
              <th style={{...ths,textAlign:"center",minWidth:60}}>Produit</th>
              <th style={{...ths,textAlign:"center",minWidth:42}} onClick={()=>doSort("du")}>Diff<Ar k="du"/></th>
              <th style={{...thsL,minWidth:100,fontSize:9}}>Dates</th>
              <th style={{...ths,minWidth:90}} onClick={()=>doSort("_ct")}>Cost<Ar k="_ct"/></th>
              <th style={ths} onClick={()=>doSort("_su")}>SU<Ar k="_su"/></th>
              <th style={ths} onClick={()=>doSort("_cpa")}>CPA SU<Ar k="_cpa"/></th>
              <th style={ths} onClick={()=>doSort("_hr")}>Hook<Ar k="_hr"/></th>
              <th style={ths} onClick={()=>doSort("_ctr")}>CTR<Ar k="_ctr"/></th>
              <th style={ths} onClick={()=>doSort("_ci")}>CVR Inst<Ar k="_ci"/></th>
              <th style={ths} onClick={()=>doSort("_cs")}>CVR SU/I<Ar k="_cs"/></th>
              <th style={ths} onClick={()=>doSort("_cpm")}>CPM<Ar k="_cpm"/></th>
            </tr>
            <tr style={{background:"#f8f8fc",borderBottom:"2px solid #e5e5e5"}}>
              <td style={{...cs,fontWeight:700,fontSize:10,color:"#888"}}>TOTAL ({sortedAds.length} créas)</td>
              <td style={cs}/><td style={cs}/>
              <td style={cs}/>
              <td style={{...cs,textAlign:"right",fontWeight:700,color:"#555"}}>{fE(totC)}</td>
              <td style={{...cs,textAlign:"right",fontWeight:700,color:"#555"}}>{fN(totSU)}</td>
              <td style={{...cs,textAlign:"right",fontWeight:700,color:"#555"}}>{totSU>0?fC1(totC/totSU):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totIM>0?fP(totV2/totIM):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totIM>0?fP2(totCL/totIM):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totCL>0?fP(totINS/totCL):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totINS>0?fP(totSU/totINS):"–"}</td>
              <td style={{...cs,textAlign:"right",color:"#888"}}>{totIM>0?fC1(totC/totIM*1000):"–"}</td>
            </tr>
          </thead>
          <tbody>
            {sortedAds.map((d,i)=>{
              const isStatic=d.f==="Static";
              const ac=ageC(d.du); const pt=prodTag(d.p);
              const cc  =d._cpa>0?mfc(d._cpa,cpaQ[0],cpaQ[1],false):{};
              const hc  =!isStatic&&d._hr>0?mfc(d._hr,hrQ[0],hrQ[1],true):{};
              const tc  =!isStatic&&d._ctr>0?mfc(d._ctr,ctrQ[0],ctrQ[1],true):{};
              const ciC =d._ci>0?mfc(d._ci,ciQ[0],ciQ[1],true):{};
              const csC =d._cs>0?mfc(d._cs,csQ[0],csQ[1],true):{};
              const cpmC=d._cpm>0?mfc(d._cpm,cpmQ[0],cpmQ[1],false):{};
              const costPct=d._ct/maxCost*100;
              const rowOpen=expanded===i;
              return (
                <tr key={i} style={{cursor:"pointer",background:rowOpen?"#fafbff":"transparent"}}
                  onClick={()=>setExpanded(rowOpen?null:i)}
                  onMouseEnter={e=>{if(!rowOpen)e.currentTarget.style.background="#fafbff";}}
                  onMouseLeave={e=>{if(!rowOpen)e.currentTarget.style.background="transparent";}}>

                  <td style={{...cs,textAlign:"left",maxWidth:240}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:5}}>
                      <span style={{marginTop:"2px",fontSize:9,color:"#ccc",flexShrink:0,display:"inline-block",transition:"transform .15s",transform:rowOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:11.5,color:"#222",lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:205}}>
                          {adDisplayName(d)}
                        </div>
                        {rowOpen&&(
                          <div style={{marginTop:5,fontSize:9,lineHeight:1.9}}>
                            {d.ad2!=="N/A"&&<div><span style={{fontWeight:700,color:"#111"}}>Angle :</span><span style={{color:"#555"}}> {d.ad2}</span></div>}
                            {d.co!=="N/A"&&<div><span style={{fontWeight:700,color:"#111"}}>Concept :</span><span style={{color:"#555"}}> {d.co}</span></div>}
                            {d.f!=="N/A"&&<div><span style={{color:"#aaa"}}>Format :</span><span style={{color:"#bbb"}}> {d.f}</span></div>}
                            {d.r!=="N/A"&&<div><span style={{color:"#aaa"}}>Réal. :</span><span style={{color:"#bbb"}}> {d.r}</span></div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{...cs,textAlign:"center"}}>
                    <span style={{padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700,background:pt.bg,color:pt.c}}>
                      {d.p==="N/A"?"–":d.p}
                    </span>
                  </td>

                  <td style={{...cs,textAlign:"center"}}>
                    <span style={{padding:"2px 5px",borderRadius:5,fontSize:9.5,fontWeight:700,background:ac.bg,color:ac.c}}>{d.du}j</span>
                  </td>

                  <td style={{...cs,textAlign:"left",fontSize:9,color:"#bbb",whiteSpace:"nowrap"}}>
                    {fDt(d.dp)} → {fDt(d.dd)}
                  </td>

                  <td style={{...cs,textAlign:"right",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:costPct+"%",background:"#e0e7ff",opacity:.4,borderRadius:"0 3px 3px 0"}}/>
                    <span style={{position:"relative",fontWeight:600}}>{fE(d._ct)}</span>
                  </td>

                  <td style={{...cs,textAlign:"right",fontWeight:600}}>{fN(d._su)}</td>
                  <td style={{...cs,textAlign:"right",fontWeight:600,...cc}}>{d._cpa>0?fC1(d._cpa):"–"}</td>
                  <td style={{...cs,textAlign:"right",...(isStatic?{background:"#f9f9f9",color:"#ddd"}:hc)}}>{isStatic?"N/A":fP(d._hr)}</td>
                  <td style={{...cs,textAlign:"right",...(isStatic?{background:"#f9f9f9",color:"#ddd"}:tc)}}>{isStatic?"N/A":fP2(d._ctr)}</td>
                  <td style={{...cs,textAlign:"right",...ciC}}>{fP(d._ci)}</td>
                  <td style={{...cs,textAlign:"right",...csC}}>{fP(d._cs)}</td>
                  <td style={{...cs,textAlign:"right",...cpmC}}>{fC1(d._cpm)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{fontSize:8.5,color:"#ccc",marginTop:6,textAlign:"center"}}>
        ▶ cliquer pour détails · Vert = top perf · Rouge = sous-perf · Static: Hook/CTR grisé
      </p>
    </div>
  );
}
