const G = 0.0000000000667;

var intervalID;

var isObjectSpawned = false;

var staticObjects = [],
    dinamicObjects = [];

var id = 1,
    idDinamicObj = -1;

var clickCoordinates = {
    x: null,
    y: null,
    xUp: null,
    yUp: null,
};

var docSize = {
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
}

function start() {
    document.getElementById('staticObj').checked = true;
    intervalID = setInterval(loop, 25);
}

function loop() {
    moveObjects();
}

function addGravityAcceleration(obj) {
    for (let i = 0; i < staticObjects.length; i++) {
        var sObj = staticObjects[i];

        let distances = getObjDistance(sObj, obj);
        let gForce = G * ((sObj.mass * obj.mass) / Math.pow(distances[0], 2));
        let cosA = distances[1] / distances[0];
        let cosB = distances[2] / distances[0];

        obj.speedX += (gForce / obj.mass) * cosA;
        obj.speedY += (gForce / obj.mass) * cosB;
    }

    for (let i = 0; i < dinamicObjects.length; i++) {
        var obj2 = dinamicObjects[i];

        if (obj.id != obj2.id) {
            let distances = getObjDistance(obj, obj2);
            let gForce = G * ((obj.mass * obj2.mass) / Math.pow(distances[0], 2));
            let cosA = distances[1] / distances[0];
            let cosB = distances[2] / distances[0];

            obj.speedX -= (gForce / obj.mass) * cosA;
            obj.speedY -= (gForce / obj.mass) * cosB;
        }
    }
}

function checkCollision(obj1, obj2) {
    var distances = getObjDistance(obj1, obj2);
    var radius;

    if (obj1.radius <= obj2.radius) {
        radius = obj1.radius;
    } else {
        radius = obj2.radius;
    }

    return distances[0] + radius < obj1.radius + obj2.radius;
}

function getObjDistance(obj1, obj2) {
    var xDistance = (obj1.x + obj1.radius) - (obj2.x + obj2.radius);
    //console.log('X: ' + xDistance);
    var yDistance = (obj1.y + obj1.radius) - (obj2.y + obj2.radius);
    //console.log('Y: ' + yDistance);
    var distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

    return [distance, xDistance, yDistance];
}

function getTwoPointsDistance(x1, y1, x2, y2) {
    var xDistance = x1 - x2;
    var yDistance = y1 - y2;
    var distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

    return [distance, xDistance, yDistance];
}

function moveObjects() {
    for (let i = dinamicObjects.length - 1; i >= 0; i--) {
        var obj = dinamicObjects[i];
        var isObjRemoved = false;

        addGravityAcceleration(obj);

        for (let k = 0; k < staticObjects.length; k++) {
            var sObj = staticObjects[k];
            //console.log(checkCollision(sObj, obj));
            if (checkCollision(sObj, obj) == true) {
                document.body.removeChild(obj.id);
                dinamicObjects.splice(i, 1);
                isObjRemoved = true;
                break;
            }
        }

        for (let k = dinamicObjects.length - 1; k >= 0; k--) {
            if (k != i && isObjRemoved == false) {
                var obj2 = dinamicObjects[k];
                if (checkCollision(obj, obj2) == true) {
                    obj2.radius = Math.sqrt((getObjArea(obj) + getObjArea(obj2)) / Math.PI);
                    obj2.width = obj2.radius * 2;
                    obj2.id.style.width = obj2.width + 'px';
                    obj2.id.style.height = obj2.width + 'px';

                    obj2.speedX = (obj.mass * obj.speedX + obj2.mass * obj2.speedX) / (obj.mass + obj2.mass);
                    obj2.speedY = (obj.mass * obj.speedY + obj2.mass * obj2.speedY) / (obj.mass + obj2.mass);

                    obj2.mass += obj.mass;

                    document.body.removeChild(obj.id);
                    dinamicObjects.splice(i, 1);
                    break;
                }
            }
        }

        obj.x += obj.speedX;
        obj.y += obj.speedY;

        obj.id.style.left = obj.x + 'px';
        obj.id.style.top = obj.y + 'px';
    }
}

function getObjArea(obj) {
    return Math.PI * Math.pow(obj.radius, 2);
}

function spawnObject() {
    if (getObjectType() == 'static') {
        let object = {
            id: document.createElement('div'),
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            radius: 100 / 2,
            mass: 1 * Math.pow(10, 14),
            color: 'red',
        }

        object.id.setAttribute('id', idDinamicObj);
        idDinamicObj--;
        object.id.setAttribute('class', 'staticObjects');
        document.body.appendChild(object.id);

        object.id.style.width = object.width + 'px';
        object.id.style.height = object.height + 'px';
        object.id.style.backgroundColor = object.color;

        object.x = clickCoordinates.x - object.radius;
        object.y = clickCoordinates.y - object.radius;
        object.id.style.top = object.y + 'px';
        object.id.style.left = object.x + 'px';

        object.x = object.id.offsetLeft;
        object.y = object.id.offsetTop;

        staticObjects.push(object);
    }

    if (getObjectType() == 'dinamic') {
        let object = {
            id: document.createElement('div'),
            x: 0,
            y: 0,
            width: 25,
            //height: 25,
            radius: 25 / 2,
            mass: 5 * Math.pow(10, 11),
            speedX: 0,
            speedY: 0,
            color: 'white',
        }

        object.id.setAttribute('id', id);
        id++;
        object.id.setAttribute('class', 'dinamicObjects');
        document.body.appendChild(object.id);

        object.id.style.width = object.width + 'px';
        object.id.style.height = object.width + 'px';
        object.id.style.backgroundColor = object.color;
        //object.id.removeAttribute('draggable');

        object.x = clickCoordinates.x - object.radius;
        object.y = clickCoordinates.y - object.radius;
        object.id.style.top = object.y + 'px';
        object.id.style.left = object.x + 'px';

        object.x = object.id.offsetLeft;
        object.y = object.id.offsetTop;

        window.dinamicObj = object; // set "object" global
        isObjectSpawned = true;
    }
}

function addObjectToArr() {
    var obj = window.dinamicObj;
    addAcceleration(clickCoordinates, obj);

    dinamicObjects.push(obj);
}

function addAcceleration(mousePos, obj) {
    var power = getTwoPointsDistance(mousePos.x, mousePos.y,
        mousePos.xUp, mousePos.yUp);
    var initialSpeed = 0.05;

    obj.speedX = initialSpeed * power[1];
    obj.speedY = initialSpeed * power[2];
}

function getObjectType() {
    var staticObjBtn = document.getElementById('staticObj');
    var dinamicObjBtn = document.getElementById('dinamicObj');

    if (staticObjBtn.checked == true) {
        return 'static';
    }

    if (dinamicObjBtn.checked == true) {
        return 'dinamic';
    }
}

function changeInput(type) {
    var staticObjBtn = document.getElementById('staticObj');
    var dinamicObjBtn = document.getElementById('dinamicObj');

    if (type == 1 && staticObjBtn.checked == false) {
        dinamicObjBtn.checked = true;
    } else if (type == 1 && staticObjBtn.checked == true) {
        dinamicObjBtn.checked = false;
    }

    if (type == 2 && dinamicObjBtn.checked == false) {
        staticObjBtn.checked = true;
    } else if (type == 2 && staticObjBtn.checked == true) {
        staticObjBtn.checked = false;
    }
}

function getMousePos1(event) {
    //console.log(event.clientX);
    //console.log(event.clientY);

    clickCoordinates.x = event.clientX;
    clickCoordinates.y = event.clientY;

    if (event.clientX < 250 && event.clientY < 150) {
        //
    } else {
        spawnObject();
    }
}

function getMousePos2(event) {
    //console.log(event.clientX);
    //console.log(event.clientY);

    clickCoordinates.xUp = event.clientX;
    clickCoordinates.yUp = event.clientY;

    //console.log(clickCoordinates);
    /*console.log(getTwoPointsDistance(clickCoordinates.x, clickCoordinates.y,
        clickCoordinates.xUp, clickCoordinates.yUp))*/

    if (isObjectSpawned == true) {
        addObjectToArr();
        isObjectSpawned = false;
    }
}

document.addEventListener("mousedown", getMousePos1);
document.addEventListener("mouseup", getMousePos2);