const SIZE = 20;
const scl = 40;
const U = [0 ,-1], D = [0 , 1], L = [-1, 0], R = [1 , 0];
const CHEATING_MODE = true;
const RESPONSE_T = 150;

let board = document.getElementById('board');
board.style.width = String(scl*SIZE) + 'px';
board.style.height = String(scl*SIZE) + 'px';
board.innerHTML

function randint(min, max){
    return Math.floor(Math.random()*(max-min)) + min;
}
function choice(array){
    len = array.length;
    return array[randint(0,len)];
}

	
class Tile{
    constructor(posX, posY){
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
        this.tile.className = 'tile green';
        this.tile.style.top = String(posY*scl + 12) + 'px';
        this.tile.style.left = String(posX*scl + 12) + 'px';
        board.appendChild(this.tile);
    }
    
    setHead(){
        this.tile.classList += ' purple';
        this.tile.innerHTML = "<img src= 'andreea.png' style='position:absolute;top:-25px;left:-25px;width:90px;height:90px' />";
        return this;
    }
    
    setBody(){
        this.tile.innerHTML = '';
        this.tile.classList = 'tile green';
        return this;
    }
    
    setFood(){
        this.tile.innerHTML = "<img src= 'dick.png' style='position:absolute;width:40px;height:40px' />";
        this.tile.classList += ' red';
        return this;
    }
    
    static erase(tile){
        board.removeChild(tile.tile);
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

class Snake{
    constructor(){
        this.ded = false;
        this.head = new Tile().setHead();
        this.body = [this.head];
        this.dir = choice([U,D,L,R]);
    }
    
    move(){
        let newX = this.head.x + this.dir[0], newY = this.head.y + this.dir[1];
        newX = (0 <= newX && newX < SIZE) ? newX : SIZE - Math.abs(newX);
        newY = (0 <= newY && newY < SIZE) ? newY : SIZE - Math.abs(newY);
        this.head = new Tile(newX, newY).setHead();
        this.body[0].setBody();
        if (Tile.matchTiles(this.head, this.body)){
            this.ded = true;    
        }
        //toEras = ;
        Tile.erase(this.body.pop()); 
        this.body.unshift(this.head);
    }
    
    addMember(){
        this.body.push(new Tile(this.head).setBody());
    }
    
    eat(tile){
        if(tile.x == this.head.x && tile.y == this.head.y){
            this.addMember()
            return true;
        } else{
            return false;
        }
        
    }
    
    chdir(dir){
        this.dir = dir;
    }
}

function addFood(snake){
    let temp = new Tile();
    while (Tile.matchTiles(temp,snake.body)){
        temp = new Tile();
    }
    return temp.setFood();
}


(function main(){
    let goodDir = (snake, d1,d2) => !(snake.dir == d2) || snake.body.length == 1;
    let snek = new Snake();
    let food = addFood(snek);
    let pause = false;
    orderStack = []
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
            goto = [R, L]
            break;
        case ' ':
            if(CHEATING_MODE) snek.addMember();
            break;
        case 'p':
            if (pause){
                pause = false
                next()
            } else {
                pause = true
            }
            break;
        }
        if (goto && goodDir(snek, goto[0], goto[1])){
            orderStack.push(goto[0]);
        }
    });
    
    let next = function(){
        return new Promise((resolve, reject) => setInterval(resolve,RESPONSE_T)).then(() => {
            if (orderStack.length > 0){
                snek.chdir(orderStack.pop());
            }
            window.requestAnimationFrame(() => snek.move());
            if (snek.eat(food)){
                Tile.erase(food);
                food = addFood(snek);
            }
            if (snek.ded){
                alert('ded')
            } else if (!pause){ 
                next();
            }
        }) 
    };
    
    next();    
})();
