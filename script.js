

const apiKey="c60b6fb3cb7dd48a8722bdf3fcb16018";
let city="rewari"
const api=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
console.log(api);

fetch(api).then((res)=>res.json())
        .then((data)=>{
          console.log(data.main.temp)
        })