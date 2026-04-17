const code = '1234';
const phone = '77770000000'; // Dummy phone
const psw = encodeURIComponent('Qorgan777@');
const message = encodeURIComponent(`Ваш код Qorgan: ${code}`);
const smscUrl = `https://smsc.ru/sys/send.php?login=jasteek&psw=${psw}&phones=${phone}&mes=${message}&fmt=3`;

console.log("Fetching URL:", smscUrl);
fetch(smscUrl)
  .then(res => res.json())
  .then(data => console.log("Result:", data))
  .catch(err => console.error("Error:", err));
