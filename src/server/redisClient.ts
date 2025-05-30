import Redis from "ioredis";

// Redis bağlantı URL'sini .env dosyanızdan alabilirsiniz.
const REDIS_URL = "redis://default:nlaNztWp6LXyBnzLimDCTnGkoESDAx1l@redis-13038.c263.us-east-1-2.ec2.redns.redis-cloud.com:13038";

// Redis bağlantısını oluştur
const redis = new Redis(REDIS_URL);

// ✅ Başarılı bağlantıyı logla
redis.on("connect", () => {
  console.log("✅ Redis bağlantısı başarılı!");
});

// 🚀 Bağlantı kurulduğunda log at
redis.on("ready", () => {
  console.log("🚀 Redis bağlantısı kullanıma hazır.");
});

// ❌ Hata oluşursa hata mesajını göster
redis.on("error", (err) => {
  console.error("❌ Redis bağlantı hatası:", err);
});

// ⚠️ Bağlantı kapandığında uyarı ver
redis.on("end", () => {
  console.warn("⚠️ Redis bağlantısı kapandı.");
});

// ❌ Bağlantı zaman aşımına uğrarsa uyarı ver
redis.on("reconnecting", (time: any) => {
  console.warn(`🔄 Redis tekrar bağlanıyor... Bekleme süresi: ${time}ms`);
});

export default redis;
