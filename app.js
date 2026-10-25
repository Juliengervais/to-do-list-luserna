    // VOTRE CLÉ SECRÈTE FIREBASE
    const firebaseConfig = {
      apiKey: "AIzaSyCYPppTlhDemeMUIyuK7cnEeR54_RvPCZE",
      authDomain: "to-do-list-luserna.firebaseapp.com",
      projectId: "to-do-list-luserna",
      storageBucket: "to-do-list-luserna.firebasestorage.app",
      messagingSenderId: "269338859205",
      appId: "1:269338859205:web:08a89cde15bb8adce882ac",
      measurementId: "G-B1JCNT5JYJ"
    };

    // Initialisation
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    let currentUser = null;

    // Vérifie la connexion
    auth.onAuthStateChanged(user => {
      if (user) {
        currentUser = user;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('app-section').style.display = 'block';
        document.getElementById('user-name').innerText = user.displayName.split(' ')[0];
        loadTasks();
      } else {
        currentUser = null;
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('app-section').style.display = 'none';
      }
    });

    function login() {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }

    function logout() {
      auth.signOut();
    }

    function addTask() {
      const input = document.getElementById('task-input');
      if (input.value.trim() === '') return;
      
      db.collection('users').doc(currentUser.uid).collection('tasks').add({
        text: input.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      input.value = '';
    }

function loadTasks() {
  db.collection('users').doc(currentUser.uid).collection('tasks').orderBy('createdAt', 'desc')
    .onSnapshot(snapshot => {
      const list = document.getElementById('task-list');
      const completedList = document.getElementById('completed-task-list');
      const completedTitle = document.getElementById('completed-title');
      
      // On vide les deux listes à chaque mise à jour
      list.innerHTML = ''; 
      completedList.innerHTML = '';
      let hasCompleted = false;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        
        // Applique le style grisé si la tâche est finalisée
        if (data.completed) {
          li.classList.add('completed');
          hasCompleted = true;
        }
        
        const taskText = document.createElement('span');
        taskText.innerText = data.text;
        li.appendChild(taskText);

        const btnGroup = document.createElement('div');

        // Bouton Valider / Annuler
        const checkBtn = document.createElement('button');
        checkBtn.innerText = data.completed ? '↩️' : '✅';
        checkBtn.className = 'delete-btn';
        checkBtn.onclick = () => {
          // Inverse le statut actuel dans la base de données
          doc.ref.update({ completed: !data.completed });
        };
        btnGroup.appendChild(checkBtn);

        // Bouton Modifier
        const editBtn = document.createElement('button');
        editBtn.innerText = '✏️';
        editBtn.className = 'delete-btn';
        editBtn.onclick = () => {
          const newText = prompt("Modifier la tâche :", data.text);
          if (newText !== null && newText.trim() !== '') {
            doc.ref.update({ text: newText });
          }
        };
        btnGroup.appendChild(editBtn);
        
        // Bouton Supprimer
        const delBtn = document.createElement('button');
        delBtn.innerText = '✖';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => doc.ref.delete(); 
        btnGroup.appendChild(delBtn);
        
        li.appendChild(btnGroup);
        
        // Trie visuellement dans la bonne liste
        if (data.completed) {
          completedList.appendChild(li); 
        } else {
          list.appendChild(li);
        }
      });

      // Affiche le titre "Tâches finalisées" seulement s'il y en a au moins une
      completedTitle.style.display = hasCompleted ? 'block' : 'none';
    });
}