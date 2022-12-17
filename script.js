const $wr = document.querySelector('[data-wr]');
const $modalWr = document.querySelector('[data-modal-wr]');
const $modalContent = document.querySelector('[data-modal-content]');

const CREATE_FORM_LS_KEY = 'CREATE_FORM_LS_KEY';
const EDIT_FORM_LS_KEY = 'EDIT_FORM_LS_KEY';

const baseUrl = 'https://cats.petiteweb.dev/api/single/DYAlex/';

const ACTIONS = {
	DETAIL: 'detail',
	DELETE: 'delete',
	EDIT: 'update',
	SHOW: 'show',
	ADD: 'add',
	CLOSE: 'close'
}

const MODALS = ['createCat', 'editCat', 'showCat'];

const formatCreateFormData = (formDataObject) => ({
	...formDataObject,
	id: +formDataObject.id,
	rate: +formDataObject.rate,
	age: +formDataObject.age,
	favorite: !!formDataObject.favorite,
})

const formatEditFormData = (formDataObject) => ({
	...formDataObject,
	rate: +formDataObject.rate,
	age: +formDataObject.age,
	favorite: !!formDataObject.favorite,
})

const mergeData = (cat, formDataObject) => ({
	...cat,
	...formDataObject,
})

const getCatHTML = (cat) => {
	let like = "like"
	if (cat.favorite) {
		like += " liked"
	}
	return `
	<div class="card" data-cat-id="${cat.id}" data-open-modal="showCat">
		<img src="${cat.image}" class="card-img" alt="${cat.name}" />
		<div class="card-body">
			<h5 class="card-title">${cat.name}</h5>
			<p class="card-text">
				${cat.description}
			</p>
		</div>
		<p class="card-likes-wrapper"><i class="fa-regular fa-heart ${like}"></i></p>
	</div>
	`
}

fetch(`${baseUrl}show/`)
	.then((res) => res.json())
	.then((data) => {
		$wr.insertAdjacentHTML('afterbegin', data.map(cat => getCatHTML(cat)).join('') )
	})
const closeModalHandler = (e) => {
	const $closeModalBtn = document.querySelector('[data-close-modal]');
	if (e.target === $modalWr || e.target === $closeModalBtn || e === 200) {
		$modalWr.classList.add('hidden');
		$modalWr.removeEventListener('click', closeModalHandler);
		if ($closeModalBtn) {
			$closeModalBtn.removeEventListener('click', closeModalHandler);
		}
		$modalContent.innerHTML = '';
	}
}
const createCat = () => {
	const $catCreateFormTemplate = document.getElementById('add-cat-form');
	const cloneCatCreateForm = $catCreateFormTemplate.content.cloneNode(true);
	$modalContent.appendChild(cloneCatCreateForm);
	const $createCatForm = document.forms.createCatForm;
	const $closeModalBtn = document.querySelector('[data-close-modal]');
	$closeModalBtn.addEventListener('click', closeModalHandler);
	$createCatForm.addEventListener('submit', (submitEvent) => {
		submitEvent.preventDefault();
		const formDataObject = formatCreateFormData(
			Object.fromEntries(new FormData(submitEvent.target).entries()),
		);

		fetch(`${baseUrl}add/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(formDataObject),
		})
		.then((res) => {
			if (res.status === 200) {
				closeModalHandler(res.status);
				return $wr.insertAdjacentHTML(
					'afterbegin',
					getCatHTML(formDataObject),
				);
			}
			throw Error('Ошибка при создании кота');
		}).catch(alert);
	})
}

const catCardHTML = (cat) => {
	let like = "like"
	if (cat.favorite) {
		like += " liked"
	}
	return `
		<img src="${cat.image}" class="card-img" alt="${cat.name}" />
		<div class="card-body" data-cat-id="${cat.id}">
			<h5 class="card-title">${cat.name}</h5>
			<span class="close" data-close-modal="showCat">&times;</span>
			<p class="card-text">
				<span class="bold">Возраст:</span> ${cat.age}
			</p>
			<p class="card-text">
				<span class="bold">Рейтинг:</span> ${cat.rate}
			</p>
			<p class="card-text">
				<span class="bold">ID:</span> ${cat.id}
			</p>
			<p class="card-text">
				<span class="bold">Обо мне:</span> ${cat.description}
			</p>
			<div class="btn-wr">
			<button data-action="${ACTIONS.EDIT}" data-open-modal="editCat" type="button" class="btn btn-primary">Изменить</button>
			<button data-action="${ACTIONS.DELETE}" type="button" class="btn btn-danger">Удалить</button>
		</div>
		<p class="card-likes-wrapper"><i class="fa-regular fa-heart ${like}"></i></p>
	`
}
const showCat = (e) => {
	const $catWr = e.target.closest('[data-cat-id]')
	const catId = $catWr.dataset.catId

	fetch(`${baseUrl}show/${catId}`)
	.then((res) => res.json())
	.then((data) => {
		$modalContent.insertAdjacentHTML('afterbegin', catCardHTML(data))
	})
	.then(() => {
		const $closeModalBtn = document.querySelector('[data-close-modal]');
		$closeModalBtn.addEventListener('click', closeModalHandler);
	})
}


const editCat = (e) => {
	if (e.target.dataset.action === ACTIONS.EDIT) {
		$modalWr.removeEventListener('click', closeModalHandler);
		$modalContent.innerHTML = '';

		const $catWr = e.target.closest('[data-cat-id]');
		const catId = $catWr.dataset.catId;

		const $catEditFormTemplate = document.getElementById('edit-cat-form');
		const cloneCatEditForm = $catEditFormTemplate.content.cloneNode(true);
		$modalContent.appendChild(cloneCatEditForm);
		const $editCatForm = document.forms.editCatForm;

		const $closeModalBtn = document.querySelector('[data-close-modal]');
		$closeModalBtn.addEventListener('click', closeModalHandler);
		console.log(catId);
		// console.log({$catWr});
		// console.log(document.querySelector(`[data-cat-id="${catId}"]`));
		let cat = {}

		fetch(`${baseUrl}show/${catId}`)
		.then((res) => res.json())
		.then((data) => {
			Object.keys(data).forEach((key) => {
				$editCatForm[key].value = data[key];
				cat[key] = data[key];
			});
		})
		$editCatForm.addEventListener('submit', (submitEvent) => {
			submitEvent.preventDefault();
			const formDataObject = formatEditFormData(
				Object.fromEntries(new FormData(submitEvent.target).entries()),
			);
			cat = mergeData(cat, formDataObject);
	
			fetch(`${baseUrl}update/${catId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formDataObject),
			})
			.then((res) => {
				if (res.status === 200) {
					closeModalHandler(res.status);
					return $wr.insertAdjacentHTML(
						'afterbegin',
						getCatHTML(cat),
					);
				}
				throw Error('Ошибка при изменении кота');
			}).catch(alert);
		})
		document.querySelector(`[data-cat-id="${catId}"]`).remove();
	}
}
const openModalHandler = (e) => {
	if (!e.target.closest('[data-open-modal]')) {
		return;
	}
	const targetModalName = e.target.closest('[data-open-modal]').dataset.openModal;
	if (MODALS.includes(targetModalName)) {
		$modalWr.classList.remove('hidden');
		$modalWr.addEventListener('click', closeModalHandler);
	}
	switch (targetModalName) {
		case 'createCat':
			createCat();
			break;
		case 'editCat': 
			editCat(e);
			break;
		case 'showCat':
			showCat(e);
			break;
	}
}	

document.addEventListener('click', openModalHandler)