const https = require('https');
const fs = require('fs');

function getPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'MyViLogoFetcher/1.0 (evaluator@myvihackathon.com) Node/16.0'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, text: data }));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'MyViLogoFetcher/1.0 (evaluator@myvihackathon.com) Node/16.0'
      }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error('Failed to download: ' + res.statusCode));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://commons.wikimedia.org/wiki/File:Vodafone_Idea_logo.svg';
  console.log('Fetching Wikimedia page for Vodafone Idea logo...');
  const { status, text } = await getPage(url);
  if (status !== 200) {
    console.error('Failed to fetch page:', status);
    return;
  }
  
  // Look for any link to upload.wikimedia.org containing Vodafone_Idea_logo.svg
  const regex = /https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[a-z0-9]\/[a-z0-9]{2}\/Vodafone_Idea_logo\.svg/i;
  const match = text.match(regex);
  if (match) {
    const svgUrl = match[0];
    console.log('Found SVG URL:', svgUrl);
    console.log('Downloading SVG...');
    await downloadFile(svgUrl, 'vi-logo-official.svg');
    console.log('Successfully saved to vi-logo-official.svg!');
  } else {
    console.error('Could not find SVG URL in HTML.');
    // Let's print any upload.wikimedia.org links
    const anyUpload = text.match(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^\s"'>]+/g);
    if (anyUpload) {
      console.log('First 5 upload URLs found:');
      console.log(anyUpload.slice(0, 5));
    }
  }
}

main().catch(console.error);
