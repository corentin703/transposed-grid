const express = require('express');
const { faker } = require('@faker-js/faker');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const makeData = (idx) => {
		return {
			id: idx,
			name: faker.name.fullName(),
			birthdate: faker.date.birthdate(),
			email: faker.internet.email(),
			company: faker.company.name(),
			address: faker.address.streetAddress(),
			city: faker.address.city(),
			country: faker.address.country(),
			cat: faker.animal.cat(),
			dog: faker.animal.dog(),
			bird: faker.animal.bird(),
			bear: faker.animal.bear(),
			avatar: faker.internet.avatar(),
			photo: faker.internet.avatar(),
			commonAvatar: 'https://corentin-verot.fr/_next/image?url=%2Fimg%2Fskills%2Ftechs%2Freact.png&w=640&q=75',
			commonPhoto: 'https://corentin-verot.fr/_next/image?url=%2Fimg%2Fskills%2Ftechs%2Freact.png&w=640&q=75',
			// editing: {
			//
			// }
		};
	}

	const data = [];

  for (let idx = 1; idx <= 50; idx++) {
    data.push(makeData(idx));
  }

  res.status(200);
  res.send(data);
});

module.exports = router;
