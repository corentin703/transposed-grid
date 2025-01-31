import { Router } from 'express';
import { faker } from '@faker-js/faker';

const router = Router();

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
			lorem5: faker.lorem.paragraphs(5),
			commonAvatar: 'https://corentin-verot.fr/_next/image?url=%2Fimg%2Fskills%2Ftechs%2Freact.png&w=640&q=75',
			commonPhoto: 'https://corentin-verot.fr/_next/image?url=%2Fimg%2Fskills%2Ftechs%2Freact.png&w=640&q=75',
			// editing: {
			//
			// }
		};
	}

	const data = [];

  for (let idx = 1; idx <= 50; idx++) {
		const generated = makeData(idx);
		let record = {};

		for (let multIdx = 1; multIdx <= 3; multIdx++) {
			if (multIdx === 1) {
				record = {
					...generated,
				};
			} else {
				Object.entries(generated).map(([value, key]) => {
					record[`${key}_${multIdx}`] = value;
				});
			}
		}

    data.push(record);
  }

  res.status(200);
  res.send(data);
});

export default router;
