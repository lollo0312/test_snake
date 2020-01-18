const BASE_COLOR = '#ad7fa8', HEAD_COLOR = '#5c3566', FOOD_COLOR = 'transparent';
const U = [0 ,-1], D = [0 , 1], L = [-1, 0], R = [1 , 0];
const RESPONSE_T = 140;
const CHEATING_MODE = true;
const POISON_P = 0.05;
const POPUP_T = 1500;

Element.prototype.setStyle = function(styleObject){
    for (key in styleObject){
        this.style[key] = styleObject[key];    
    }
}

function randint(min, max){
    return Math.floor(Math.random()*(max-min)) + min;
}
function choice(array){
    len = array.length;
    return array[randint(0,len)];
}

class Interface{
    constructor(){
        this.window = document.getElementById('mainWindow')
        this.layout = document.createElement('div');
        this.layout.setStyle({
            'display' : 'flex',
            'flex-direction' : 'column',
        });
        this.board = document.createElement('div');
        let height = this.computedWidth = Math.floor(Math.floor(Math.min(window.innerWidth,window.innerHeight)*.8)/SIZE)*SIZE;
        this.board.setStyle({
            'border' : '4px solid black',
            'height' : String(height) + 'px',
            'width'  : String(height) + 'px',
            'background-color' : '#e28585',
        });
        
        this.window.appendChild(this.layout);
        this.layout.appendChild(this.board);
    }
    
    erase(tile){
        this.board.removeChild(tile.tile);
    }
    
    initPopUp(name){
        let popUp = this.popUp = document.createElement('div');
        popUp.restart = () => {
            popUp.setStyle({
                'color' : 'transparent',
                'transition' : 'color .5s ease-in-out'
            });
            this.innerHTML = '';
        };
        this.window.appendChild(popUp);
        return this;
    }
    
    initCounter(defaultText){
        this.counter = document.createElement('div');
        this.counter.setStyle({
            'font-family' : 'sans-serif',
            'font-weight' : 'bold',
            'font-size'   : '2em',
        });
        this.counter.innerHTML = defaultText;
        this.counter.update = (n) => {this.counter.innerHTML = defaultText + String(n);};
        this.layout.appendChild(this.counter);
        return this;
    }

    initMenu(page){
        /*Attention needs menu div to work*/
        if(!this.menus) this.menus = [];
        let menu = this.menus[page] = document.getElementById('menu '+ String(page));
        menu.parentElement.removeChild(menu);
        let width = this.computedWidth;
        let top = this.board.offsetTop;
        let left = this.board.offsetLeft;
        menu.setStyle({
            'display' : 'none',
            'position' : 'absolute',
            'top' : String(top+4) + 'px',
            'left' : String(left+4) + 'px',
            'width' : String(width) + 'px',
            'height' : String(width) + 'px',
            'font-family' : 'sans-serif',
            'background-color' : 'rgba(100,100,100,.7)',
            'font-size' : '2em',
        });
        menu.show = () => {
            menu.setStyle({'display':'block'});    
        };
        menu.hide = () => {
            menu.setStyle({'display':'none'});
        };
        this.window.appendChild(menu);
        return this;
    }        
}

class Tile{
    constructor(parent, posX, posY){
        let scl = parent.scl;
        this.parent = parent;
        if (typeof posX == 'undefined'){
            posY = randint(0,SIZE);
            posX = randint(0,SIZE);
        } else if (posX instanceof Tile){
            posY = posX.y;
            posX = posX.x;       
        }
        this.x = posX;
        this.y = posY;
        this.tile = document.createElement('div');
        this.tile.setStyle({
            'position' : 'absolute',
            'border-radius' : '5px',
            'background-color' : BASE_COLOR,
            'width' : String(scl) + 'px',
            'height': String(scl) + 'px',
            'top' : String(posY*scl + 12) + 'px',
            'left': String(posX*scl + 12) + 'px',
        });
        this.parent.board.appendChild(this.tile);
    }
    
    setHead(){
        let scl = this.parent.scl;
        this.tile.setStyle({
            'background-color' : HEAD_COLOR,
        });
        this.tile.innerHTML = "<img src= 'head.png' style='width:" + String(scl) + "px;height:" + String(scl) + "px'/>";
        return this;
    }
    
    setBody(){
        this.tile.setStyle({
           'background-color' : BASE_COLOR,
        });
        this.tile.innerHTML = '';
        return this;
    }
    
    setFood(){
        this.poisonous = false;
        let scl = this.parent.scl;
        this.tile.setStyle({
            'border-radius' : String(parent/2) + 'px',
            'background-color' : FOOD_COLOR,
        })
        this.tile.innerHTML = "<img src= 'food.png' style='width:" + String(scl) + "px;height:" + String(scl) + "px'/>";
        return this;
    }
    
    setPoison(){
        this.poisonous = true;
        let scl = this.parent.scl;
        this.tile.setStyle({
            'border-radius' : String(parent/2) + 'px',
            'background-color' : FOOD_COLOR,
        })
        this.tile.innerHTML = "<img src= 'poison.png' style='width:" + String(scl) + "px;height:" + String(scl) + "px'/>";
        return this;
    }
    
    static matchTiles(tile, tiles){
        let out = false;
        for (let t of tiles){
            if (tile.x == t.x && tile.y == t.y){
                out = true;
            }
        }
        return out;
    }
}

class SnakeGame{
    constructor(){
        this.gameBoard = new Interface().initPopUp().initCounter('Nombre de Ziz englouties: ').initMenu(0).initMenu(1).initMenu(2);
        this.gameBoard.scl = Math.floor(this.gameBoard.computedWidth / SIZE);
        
        this.ded = false;
        this.moving = true;
        this.head = new Tile(this.gameBoard).setHead();
        this.body = [this.head];
        this.dir = choice([U,D,L,R]);
    }
    
    move(){
        let newX = this.head.x + this.dir[0], newY = this.head.y + this.dir[1];
        newX = (0 <= newX && newX < SIZE) ? newX : SIZE - Math.abs(newX);
        newY = (0 <= newY && newY < SIZE) ? newY : SIZE - Math.abs(newY);
        this.head = new Tile(this.gameBoard, newX, newY).setHead();
        this.body[0].setBody();
        if (Tile.matchTiles(this.head, this.body)){
            this.ded = true;    
        }
        this.body.unshift(this.head);
        if(this.moving){
            this.gameBoard.erase(this.body.pop());    
        } else{
            this.moving = true
        }
    }
    
    addMember(){
        this.moving = false;
    }
    
    eat(tiles){
        for (let tile of tiles){
            if(tile.x == this.head.x && tile.y == this.head.y){
                if (!tile.poisonous){
                    this.addMember()
                    this.gameBoard.counter.update(this.body.length);
                    if(this.body.length > best_score) updateBest(this.body.length);
                }
                return tile;
            }   
        }
        return false;
    }
    
    chdir(dir){
        this.dir = dir;
    }
    
    addFood(){
        let temp = new Tile(this.gameBoard);
        while (Tile.matchTiles(temp,this.body)){
            this.gameBoard.erase(temp);
            temp = new Tile(this.gameBoard);
        }
        if (Math.random() <= POISON_P){
            new Promise((a,b) => setTimeout(()=>a(),10000)).then(()=> removePoison(temp));
            return temp.setPoison();
        }
        else{
            return temp.setFood();
        }
    }
}


/*Remake Main properly*/
let goodDir = (snake, d1,d2) => !(snake.dir == d2 || snake.dir == d1) || snake.body.length == 1;
let snek;
let food;
let pause;
let orderStack;
let best_score;
let best = document.getElementById('best');
let invertCommands = false;
let shown = [false,false,false];
let music = document.getElementById('music');

function mainMenu(){
    if (snek) deletall();
    best_score = 0;
    snek = new SnakeGame();
    snek.gameBoard.layout.setStyle({'display':'none'});
    snek.gameBoard.menus[2].setStyle({
        'display' : 'block',
        'background-color' :'black',
        'height' : String(Math.min(window.innerWidth,window.innerHeight)) + 'px',
        'width' : String(Math.min(window.innerWidth,window.innerHeight)) + 'px',
        'color' : 'white',
    });
        
}

best.setStyle({
    'transition' : 'color .15s ease-in-out',
    'font-family' : 'sans-serif',
    'font-weight' : 'bold',
    'font-size'   : '2em',
});
let bestText = best.innerHTML;
function updateBest(n){
    best.style.color = 'rebeccapurple';
    new Promise((a,b)=> setTimeout(()=>a(),300)).then(()=> {best.style.color = 'black';});
    best_score = n;
    best.innerHTML = bestText + String(n);
}

function deletall(){
    let win = snek.gameBoard.window;
    for (menu of snek.gameBoard.menus){
        win.parentElement.appendChild(menu);
    }
    while(win.hasChildNodes()){
        win.removeChild(win.firstChild);
    }
}

let SIZE;
function restart(size){
    snek.gameBoard.menus[2].hide()
    if(size) SIZE = size;
    music.play();
    deletall();
    snek = new SnakeGame();
    food = [snek.addFood()];
    pause = false;
    shown = [false,false,false];
    orderStack = [];
    next();
}


function unpause(){
    pause = false;
    snek.gameBoard.menus[0].hide(); 
    next();
}

function zizTime(){
    let ziz = snek.gameBoard.popUp;
    ziz.innerHTML = "IT's ZIZ TIME";
    ziz.setStyle({
        'color':'mediumvioletred',
        'position' : 'absolute',
        'font-family' : 'sans-serif',
        'background-color' : 'transparent',
        'font-size' : '5em',
        'top' : String(snek.gameBoard.scl*SIZE/2) + 'px',
        'left' : String(snek.gameBoard.scl*SIZE/6) + 'px',
    });
    new Promise((resolve,reject) => setTimeout(resolve,1000)).then(() => ziz.restart());
    for (let i=0; i < SIZE/2; i++){
        food.push(snek.addFood());
    }
}

function urDrunk(){
    let drunk = snek.gameBoard.popUp;
    drunk.innerHTML = "OH NO UR DRUNK";
    drunk.setStyle({
        'color':'darkgreen',
        'position' : 'absolute',
        'font-family' : 'sans-serif',
        'background-color' : 'transparent',
        'font-size' : '5em',
        'top' : String(snek.gameBoard.scl*SIZE/2) + 'px',
        'left' : String(snek.gameBoard.scl*SIZE/6) + 'px',
    });
    let bord = snek.gameBoard.board;
    bord.setStyle({
      'transition' : 'border-color 1s ease-in-out',
      'border-color': 'darkgreen',
    });
    new Promise((resolve,reject) => setTimeout(resolve,POPUP_T)).then(() => drunk.restart());
    invertCommands = true;
}

function removePoison(tile){
    snek.gameBoard.board.setStyle({'border-color':'black'});
    invertCommands = false;
    snek.gameBoard.erase(tile);
    food.splice(food.indexOf(tile),1);
}

function showMessage(message){
    let prompt = snek.gameBoard.popUp;
    prompt.innerHTML = message;
    prompt.setStyle({
        'color':'black',
        'position' : 'absolute',
        'font-family' : 'sans-serif',
        'background-color' : 'transparent',
        'font-size' : '4em',
        'top' : String(snek.gameBoard.scl*SIZE/2) + 'px',
        'left' : String(snek.gameBoard.scl*SIZE/4) + 'px',
    });
    new Promise((resolve,reject) => setTimeout(resolve,POPUP_T)).then(() => prompt.restart());    
}

document.addEventListener('keypress', function(e){
    var goto;
    switch (e.key){
    case 'z': 
        goto = [U, D];
        break;
    case 'q':
        goto = [L, R];
        break;
    case 's':
        goto = [D, U];
        break;
    case 'd':
        goto = [R, L];
        break;
    case ' ':
        if(CHEATING_MODE) snek.addMember();
        break;
    case 'p':
        if (pause){
            unpause()
        } else {
            pause = true;
            snek.gameBoard.menus[0].show();
        }
        break;
    case 'h':
        if(CHEATING_MODE) zizTime();
    }
    if (goto && goodDir(snek, goto[0], goto[1])){
        if (invertCommands){
            orderStack.push(goto[1]);
        } else{
            orderStack.push(goto[0]);
        }
    }
});


let next = function(){
    return new Promise((resolve, reject) => setTimeout(resolve,RESPONSE_T)).then(() => {
        if (snek.ded){
            snek.gameBoard.menus[1].show();
        }
        if (Math.random()<=.002){
            zizTime();
        }
        if (orderStack.length > 0){
            snek.chdir(orderStack.pop());
        }
        window.requestAnimationFrame(() => snek.move());
        let eaten = snek.eat(food); 
        if (eaten){
            if (eaten.poisonous) urDrunk();
            snek.gameBoard.erase(eaten);
            food.splice(food.indexOf(eaten),1);
        }
        if (food.length < 1){
            food.push(snek.addFood());
        }
        
        if(snek.body.length > SIZE*SIZE/8 && !shown[0]){
            showMessage(String(Math.floor( SIZE*SIZE/8)) + '?!!!!! AMAZING!');
            shown[0] = true;
        } else if (snek.body.length > SIZE*SIZE*3/8 && !shown[1]){
            showMessage(String(Math.floor( SIZE*SIZE*3/8)) + 'ziz!!! Assssstonishing');
            shown[1] = true;
        } else if (snek.body.length > SIZE*SIZE/4 && !shown[2]){
            showMessage(String(Math.floor(SIZE*SIZE/4)) + 'ziz?! Impresssssive');
            shown[2] = true;
        }
        if (!snek.ded && !pause){
            next();
        }
    }) 
};

mainMenu();   

