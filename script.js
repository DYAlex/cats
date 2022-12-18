const $wr = document.querySelector('[data-wr]');
const $modalWr = document.querySelector('[data-modal-wr]');
const $modalContent = document.querySelector('[data-modal-content]');

const CREATE_FORM_LS_KEY = 'CREATE_FORM_LS_KEY';

const baseUrl = 'https://cats.petiteweb.dev/api/single/DYAlex/';

const ACTIONS = {
	DELETE: 'delete',
	EDIT: 'update',
	LIKE: 'like',
}

const MODALS = ['createCat', 'editCat', 'showCat'];

const formatCreateFormData = (formDataObject) => ({
	...formDataObject,
	id: +formDataObject.id,
	rate: +formDataObject.rate,
	age: +formDataObject.age,
	favorite: !!formDataObject.favorite,
});

const formatEditFormData = (formDataObject) => ({
	...formDataObject,
	rate: +formDataObject.rate,
	age: +formDataObject.age,
	favorite: !!formDataObject.favorite,
});

const getCatHTML = (cat) => {
	let like = "like";
	if (cat.favorite) {
		like += " liked";
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
		<p class="card-likes-wrapper"><i class="fa-regular fa-heart ${like}" data-cat-like-btn="" data-action="${ACTIONS.LIKE}"></i></p>
	</div>
	`
}

const getModalCatHTML = (cat) => {
	let like = "like";
	if (cat.favorite) {
		like += " liked";
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
			<p class="card-likes-wrapper"><i class="fa-regular fa-heart ${like}" data-cat-like-btn="" data-action="${ACTIONS.LIKE}"></i></p>
		</div>
	`
}

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

fetch(`${baseUrl}show/`)
	.then((res) => res.json())
	.then((data) => {
		$wr.insertAdjacentHTML('afterbegin', data.map(cat => getCatHTML(cat)).join('') );
	})

const createCat = () => {
	// получаем форму из шаблона
	const $catCreateFormTemplate = document.getElementById('add-cat-form');
	const cloneCatCreateForm = $catCreateFormTemplate.content.cloneNode(true);
	$modalContent.appendChild(cloneCatCreateForm);
	// создаем форму
	const $createCatForm = document.forms.createCatForm;

	// работаем с локальных хранилищем
	const dataFromLS = localStorage.getItem(CREATE_FORM_LS_KEY);
    const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS);
    if (preparedDataFromLS) {
      Object.keys(preparedDataFromLS).forEach((key) => {
        $createCatForm[key].value = preparedDataFromLS[key];
      })
    }

	$createCatForm.addEventListener('change', () => {
		const formattedData = formatCreateFormData(
		  Object.fromEntries(new FormData($createCatForm).entries()),
		)
  
		localStorage.setItem(CREATE_FORM_LS_KEY, JSON.stringify(formattedData));
	})
	$createCatForm.addEventListener('submit', (submitEvent) => {
		submitEvent.preventDefault();
		const formDataObject = formatCreateFormData(
			Object.fromEntries(new FormData(submitEvent.target).entries()),
		);
        if (formDataObject.id && formDataObject.name) {

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
					// очищаем локальное хранилище при успешном добавлении кота
					localStorage.removeItem(CREATE_FORM_LS_KEY);
					return $wr.insertAdjacentHTML(
						'afterbegin',
						getCatHTML(formDataObject),
					);
				}
				throw Error('Ошибка при создании кота');
			}).catch(alert);
		} else {
			alert('Ошибка при создании кота. Не заполнены обязательные поля в форме');
		}
	})
}

const deleteCat = (e) => {
	if (e.target.dataset.action === ACTIONS.DELETE) {
		const $catWr = e.target.closest('[data-cat-id]');
		const catId = $catWr.dataset.catId;

		fetch(`${baseUrl}delete/${catId}`, {
			method: 'DELETE',
		}).then((res) => {
			if (res.status === 200) {
				closeModalHandler(res.status);
				document.querySelector(`[data-cat-id="${catId}"]`).remove();
				return $modalContent.remove();
			}

			alert(`Удаление кота с id = ${catId} не удалось`);
		})
	}
}

const showCat = (catId) => {
	fetch(`${baseUrl}show/${catId}`)
	.then((res) => res.json())
	.then((data) => {
		$modalContent.insertAdjacentHTML('afterbegin', getModalCatHTML(data));
	})

	$modalContent.addEventListener('click', deleteCat);
}

const editCat = (catId) => {
		// очищаем модалку
		$modalContent.innerHTML = '';
		// получаем форму из шаблона
		const $catEditFormTemplate = document.getElementById('edit-cat-form');
		const cloneCatEditForm = $catEditFormTemplate.content.cloneNode(true);
		$modalContent.appendChild(cloneCatEditForm);
		// создаем предзаполненную форму
		const $editCatForm = document.forms.editCatForm;
		// получаем данные для предзаполнения формы
		fetch(`${baseUrl}show/${catId}`)
		.then((res) => res.json())
		.then((data) => {
			Object.keys(data).forEach((key) => {
				$editCatForm[key].value = data[key];
			});
		})

		$editCatForm.addEventListener('submit', (submitEvent) => {
			submitEvent.preventDefault();
			const formDataObject = formatEditFormData(
				Object.fromEntries(new FormData(submitEvent.target).entries()),
			);
			if (formDataObject.name) {
				delete formDataObject.name;
			}
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
					document.querySelector(`[data-cat-id="${catId}"]`).remove();
					return fetch(`${baseUrl}show/${catId}`)
							.then((res) => res.json())
							.then((data) => {
								$wr.insertAdjacentHTML(
									'afterbegin',
									getCatHTML(data),
								);
							});
				}
				throw Error('Ошибка при изменении кота');
			}).catch(alert);
		})
}

const likeCat = (e) => {
	let $likeBtn = e.target;
	if ($likeBtn.dataset.action === ACTIONS.LIKE) {
		const $catWr = e.target.closest('[data-cat-id]');
		const catId = $catWr.dataset.catId;

		let favorite = {
			"favorite": true
		};

		fetch(`${baseUrl}show/${catId}`)
		.then((res) => res.json())
		.then((data) => {
			favorite.favorite = !data.favorite;
		})

		fetch(`${baseUrl}update/${catId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(favorite),
		})
		.then((res) => {
			if (res.status === 200) {
				return $likeBtn.classList.toggle('liked');
			}
			throw Error('Ошибка при изменении кота');
		}).catch(alert);
	}
}

const openModalHandler = (e) => {
	if (!e.target.closest('[data-open-modal]') || e.target.closest('[data-cat-like-btn]')) {
		return;
	}
	const targetModalName = e.target.closest('[data-open-modal]').dataset.openModal;
	if (MODALS.includes(targetModalName)) {
		$modalWr.classList.remove('hidden');
		$modalWr.addEventListener('click', closeModalHandler);
		$modalWr.addEventListener('click', likeCat);
	}
	if (targetModalName !== 'createCat') {
		const $catWr = e.target.closest('[data-cat-id]');
		const catId = $catWr.dataset.catId;
		switch (targetModalName) {
			case 'editCat': 
				editCat(catId);
				break;
			case 'showCat':
				showCat(catId);
				break;
		}
	} else {
		createCat();
	}
}	

document.addEventListener('click', openModalHandler);

$wr.addEventListener('click', likeCat);