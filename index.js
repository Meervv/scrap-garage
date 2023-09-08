const axios = require('axios');
const cheerio = require('cheerio');

// Fonction pour récupérer les informations d'un département
async function getInfosDepartement(region, departement) {
  return new Promise(async (resolve, reject) => {
    const baseURL = 'https://www.franceparebrise.fr/pare-brise/';
    const url = `${baseURL}/${region}/${departement}`;
    const donneesDepartement = {
        region: region,
        nom: departement,
        informations: []
    };

    try {
      const response = await fetch(url);

      if (response.status !== 200) {
        console.error(`La requête pour ${departement} a échoué.`);
        reject(`La requête pour ${departement} a échoué.`);
        return;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Utilisez $ pour sélectionner et traiter les informations du département ici
      const rdvCardBodies = $('.rdv-card_body');

      rdvCardBodies.each((index, element) => {
        // Sélectionnez l'élément <a> à l'intérieur de chaque div
        const lien = $(element).find('a').attr('href');
        donneesDepartement.informations.push({
          lien: lien
        });
      });
      resolve(donneesDepartement);
    } catch (error) {
      console.error(`Une erreur s'est produite lors de la récupération des informations pour ${departement}:`, error);
      reject(`Une erreur s'est produite lors de la récupération des informations pour ${departement}: ${error}`);
    }
  });
}

async function getDataOnOnePage(url) {
    try {
    const response = await fetch(url);

    if (response.status !== 200) {
      throw new Error(`La requête a échoué pour ${url}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
 
    const pageTitle = $('.ficheCentre-title').text().trim();
    const title = pageTitle.split('\n')[0];
    const pageNote = $('.ficheCentre-ratings_score').text().trim();
    const note = pageNote.split('\n')[0];
    const pageAvis = $('.rdv-card_ratingsTotal button').text();
    const avis = pageAvis.split(')')[0].replace(/\(/, '');
    const itineraire = $('a:contains("Itinéraire")').attr('href');
    // const cta_rdv = $('a:contains("Prendre rendez-vous")').attr('href');
    const adresse = $('.address').text().trim();
    const telephone = $('a[href^="tel:"]').attr('href').trim();
    const horaires = $('.ficheCentre-schedule').text().trim();
    const horairesClean = horaires.replace(/\n/g, '').replace(/\s/g, '');

    const pageData = {
      title: title,
      note: note,
      avis: avis,
      itineraire: itineraire,
      cta_rdv: 'https://client.franceparebrise.net/open-arrival/auto',
      adresse: adresse,
      telephone: telephone,
      horaires: horairesClean
    };

    return pageData;
  } catch (error) {
    throw new Error(`Une erreur s'est produite lors de la récupération des informations pour ${url}: ${error.message}`);
  }
}

// Test de getInfosDepartement
const region = 'normandie';
const departement = 'eure';

getInfosDepartement(region, departement)
  .then(data => {
    // Vous pouvez maintenant parcourir les informations pour chaque lien et appeler getDataOnOnePage pour chaque URL.
    for (const information of data.informations) {
      const lien = information.lien;
      const url = `https://www.franceparebrise.fr${lien}`;
      
      // Appel à getDataOnOnePage pour chaque URL
      getDataOnOnePage(url)
        .then(pageData => {
          console.log(pageData);
        })
        .catch(error => {
          console.error(error);
        });
    }
  })
  .catch(error => {
    console.error(error);
  });
