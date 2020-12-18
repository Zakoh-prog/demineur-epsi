var Demineur = {
    nom: 'Demineur',

    difficultes: {
        debutant: {
            lignes: 9,
            colonnes: 9,
            mines: 10,
        },
        intermediaire: {
            lignes: 16,
            colonnes: 16,
            mines: 40,
        },
        expert: {
            lignes: 22,
            colonnes: 22,
            mines: 100,
        },
        maitre: {
            lignes: 30,
            colonnes: 30,
            mines: 250,
        },
    },

    param: {

    },

    partie: {
        status: 0,
        champ_mine: new Array(),
        timer:0,
    },

    initialise: function() {
        this.startGame('debutant');
    },

    startGame: function(diff) {
        this.param = this.difficultes[diff];
        this.afficherPlateau();
        this.creerPartie();

    },

    afficherPlateau: function() {

        plateau = document.getElementById('plateau');
        plateau.innerHTML = '';

        document.getElementById('result').innerHTML = '';

        table = document.createElement('table');
        table.setAttribute('oncontextmenu', 'return false;');
        champ = document.createElement('tbody');
        table.appendChild(champ);
        table.className = 'champ';

        plateau.appendChild(table);

        for (i = 1; i <= this.param['lignes']; i++) {
            line = document.createElement('tr');

            for (j = 1; j <= this.param['colonnes']; j++) {
                cell = document.createElement('td');
                cell.id = 'cell-'+i+'-'+j;
                cell.className = 'cell';
                cell.setAttribute('onclick', this.nom+'.verifPos('+i+', '+j+', true);');
                cell.setAttribute('oncontextmenu', this.nom+'.flagPos('+i+', '+j+'); return false;');
                cell.innerHTML='<img src="images/normal.png"/>';
                line.appendChild(cell);
            }
            champ.appendChild(line);
        }
    },

    creerPartie: function() {

        /* creation du tableau vide */
        this.partie.champ_mine = new Array();
        for (i = 1; i <= this.param['lignes']; i++) {
            this.partie.champ_mine[i] = new Array();
            for (j = 1; j <= this.param['colonnes']; j++) {
                this.partie.champ_mine[i][j] = 0;
            }
        }

        /* ajout des mines */
        for (i = 1; i <= this.param['mines']; i++) {
            /* On place la mine de facon aleatoire */
            x = Math.floor(Math.random() * (this.param['colonnes'] - 1) + 1);
            y = Math.floor(Math.random() * (this.param['lignes'] - 1) + 1);
            while (this.partie.champ_mine[x][y] == -1) {
                x = Math.floor(Math.random() * (this.param['colonnes'] - 1) + 1);
                y = Math.floor(Math.random() * (this.param['lignes'] - 1) + 1);
            }
            this.partie.champ_mine[x][y] = -1;

            /* mise à jour des cases adjacentes */
            for (j = x-1; j <= x+1; j++) {
                if (j == 0 || j == (this.param['colonnes'] + 1))
                    continue;
                for (k = y-1; k <= y+1; k++) {
                    if (k == 0 || k == (this.param['lignes'] + 1))
                        continue;
                    if (this.partie.champ_mine[j][k] != -1)
                        this.partie.champ_mine[j][k] ++;
                }
            }
        }

        /* definition du status de la partie à "en cours" */
        this.partie.status = 1;
    },

    verifPos: function(x, y, check) {

        /* on verifie si une partie est en cours */
        if (this.partie.status != 1)
            return;

        /* on verifie si la case est deja decouverte */
        if (this.partie.champ_mine[x][y] == -2) {
            return;
        }

        /* on verifie si la case est marquée d'un drapeau */
        if (this.partie.champ_mine[x][y] < -90) {
            return;
        }

        /* verifie si la case contient une mine */
        if (this.partie.champ_mine[x][y] == -1) {

            document.getElementById('cell-'+x+'-'+y).innerHTML = '<img src="images/bomb.png"/>';
            this.defaite();
            return;
        }

        /* marquage de la case comme verifiee */

        if (this.partie.champ_mine[x][y] > 0) {
            /* On marque le nombre de mines dans les cases adjacentes */
            document.getElementById('cell-'+x+'-'+y).innerHTML = '<img src="images/'+this.partie.champ_mine[x][y]+'.png"/>';

            /* On marque la case comme decouverte */
            this.partie.champ_mine[x][y] = -2;
        } else if (this.partie.champ_mine[x][y] == 0) {
            /* On marque la case comme decouverte */
            document.getElementById('cell-'+x+'-'+y).innerHTML = '<img src="images/0.png"/>';
            this.partie.champ_mine[x][y] = -2;

            /* On devoile les cases adjacentes */
            for (var j = x-1; j <= x+1; j++) {
                if (j == 0 || j == (this.param['colonnes'] + 1))
                    continue;
                for (var k = y-1; k <= y+1; k++) {
                    if (k == 0 || k == (this.param['lignes'] + 1))
                        continue;
                    if (this.partie.champ_mine[j][k] > -1) {
                        this.verifPos(j, k, false);
                    }
                }
            }
        }

        /* verification de la victoire si necessaire */
        if (check !== false)
            this.verifWin();
    },

    flagPos: function(x, y) {

        /* verification du statut de la partie */
        if (this.partie.status != 1)
            return;

        /* verifie si la case a deja ete decouverte */
        if (this.partie.champ_mine[x][y] == -2)
            return;

        if (this.partie.champ_mine[x][y] < -90) {
            /* retire le drapeau */

            document.getElementById('cell-'+x+'-'+y).innerHTML = '<img src="images/normal.png"/>';
            this.partie.champ_mine[x][y] += 100;

        } else {
            /* pose le drapeau */

            document.getElementById('cell-'+x+'-'+y).innerHTML = '<img src="images/flag.png"/>';
            this.partie.champ_mine[x][y] -= 100;
        }
    },

    verifWin: function() {
        /* verification de toutes les cases */
        for (var i = 1; i <= this.param['lignes']; i++) {
            for (var j = 1; j <= this.param['colonnes']; j++) {
                v = this.partie.champ_mine[i][j];
                if (v != -1 && v != -2 && v != -101)
                    return;
            }
        }

        /* aucune case bloquante trouvee, on affiche la victoire */
        this.victoire();
    },

    victoire: function() {
        /* affichage du resultat en couleur */
        document.getElementById('result').innerHTML = 'Gagné</br>';
        document.getElementById('result').style.color = '#43b456';
        this.devoiler();

        /* definition de l'etat de la partie a termine */
        this.partie.status = 0;

        document.cookie = "temps="+this.partie.timer;
        document.cookie = "diff="+this.param;
    },

    defaite: function() {
        /* affichage du resultat en couleur */
        document.getElementById('result').innerHTML = 'Perdu';
        document.getElementById('result').style.color = '#CC3333';


        this.devoiler();

        /* definition de l'etat de la partie a termine */
        this.partie.status = 0;
    },

    devoiler: function(){
      for (var i = 1; i <= this.param['lignes']; i++) {
          for (var j = 1; j <= this.param['colonnes']; j++) {


            if(this.partie.champ_mine[i][j]>= 0 &&  this.partie.champ_mine[i][j]<=8){
              document.getElementById('cell-'+i+'-'+j).innerHTML = '<img src="images/'+this.partie.champ_mine[i][j]+'.png"/>';
            }else if (this.partie.champ_mine[i][j] == -1 || this.partie.champ_mine[i][j] == -101) {
              document.getElementById('cell-'+i+'-'+j).innerHTML = '<img src="images/bomb.png"/>';
            }else if(this.partie.champ_mine[i][j] < -2){
              document.getElementById('cell-'+i+'-'+j).innerHTML = '<img src="images/'+(this.partie.champ_mine[i][j]+100)+'.png"/>';
            }
          }
        }
    },
    compteur: function(){
      if(this.partie.status==1){
        this.partie.timer+=100;

        var cpt = document.getElementById('cpt');
        var secondes=0;
        var minutes=0;
        var heures=0;
        if((parseInt(this.partie.timer/1000)%60)<10){
          secondes =  "0"+parseInt(this.partie.timer/1000)%60;
        }
        if((parseInt(this.partie.timer/1000/60)%60)<10){
          minutes = "0"+parseInt(this.partie.timer/1000/60)%60;
        }
        if((parseInt(this.partie.timer/1000/60/60))<10){
          heures = "0"+parseInt(this.partie.timer/1000/60/60);
        }
        if((parseInt(this.partie.timer/1000)%60)>=10){
          secondes =  parseInt(this.partie.timer/1000)%60;
        }
        if((parseInt(this.partie.timer/1000/60)%60)>=10){
          minutes = +parseInt(this.partie.timer/1000/60)%60;
        }
        if((parseInt(this.partie.timer/1000/60/60))>=10){
          heures = +parseInt(this.partie.timer/1000/60/60);
        }



        cpt.textContent=""+heures+":"+minutes+":"+secondes
      }
    }
};

window.setInterval(function(){Demineur.compteur();},100);
