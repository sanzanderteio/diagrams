const editor = document.querySelector("#editor");
const field = document.querySelector("#field");
const body = document.querySelector("body");

const editar = document.querySelector("#editar");
const gerar = document.querySelector("#gerar");

var components = [];

const compPrefixes = ["@","#"];

// [[att,val],[att,val]]
function generateElement({type, classes, content, parent, attrib, props}) {

    let elType;
    if (type) elType = type;
    else elType = "div";

    let temp = document.createElement(elType);

    if (classes) for (cl of classes) temp.classList.add(cl);
    if (attrib) for (at of attrib) temp.setAttribute(at[0], at[1]);
    if (props) for (prop of props) temp.style.setProperty(prop[0],prop[1]);
    if (content) temp.innerHTML = content;

    if (parent) {
        parent.appendChild(temp);
        console.log(typeof(temp));
    } else return temp;
}

function gen() {
    field.innerHTML = "";

    let code = editor.value.split(/\r?\n/);

    // Listar componentes
    for (line of code) {
        let words = line.split(" ");

        for (word of words) {
            if (
                (compPrefixes.includes(word.charAt(0))) &&
                !components.includes(word)
            ) components.push(word);
        }
    }

    // cabeçalho

    let headerSlice = generateElement({
        classes: ["field-slice", "field-slice--header"]
    });

    field.appendChild(headerSlice);

    for (comp of components) {
        let content;
        if (comp.charAt(0) == "@") {
            content = `<div class="field-component__header field-component__header--actor">
            <svg viewBox="0 0 1 1">
                <path d="M 0.5,0.67197333 0.72834088,0.90031422 M 0.5,0.67197333 0.27165912,0.90031422 M 0.5,0.34905056 V 0.67197333 M 0.22926676,0.4077638 H 0.77073324 M 0.62395017,0.2251004 A 0.12395016,0.12395016 0 0 1 0.5,0.34905056 0.12395016,0.12395016 0 0 1 0.37604984,0.2251004 0.12395016,0.12395016 0 0 1 0.5,0.10115024 0.12395016,0.12395016 0 0 1 0.62395017,0.2251004 Z"></path>
            </svg>
                <span class="component-name">${comp}</span>
            </div>
            <div class="field-component__lifeline field-component__lifeline--header"></div>`
        } else {
            content = `<div class="field-component__header">${comp}</div>
            <div class="field-component__lifeline field-component__lifeline--header"></div>`
        }

        let compTemp = generateElement({
            classes: ["field-component"],
            content: content,
            attrib: [["data-name",comp]]
        })

        headerSlice.appendChild(compTemp);
    }

    // corpo

    let sub = undefined;
    var subs = [];

    for (line of code) {
        let words = line.split(" ");
        // ["@Actor", "retorna", "200", "#Comp"]
        let string = [];
        let indexes = [];

        for (word of words) {
            // procurar outros tipos de linha
            if (words.indexOf(word) == 0 &&
                word.charAt(0) == "[") {
                sub = word.slice(1);
                subs.push(sub);
                continue;
            }

            if (words.indexOf(word) == 0 &&
                word.charAt(0) == "]") {
                sub = undefined;
                continue;
            }

            if (!compPrefixes.includes(word.charAt(0))) {
                string.push(word);
                // string = ["retorna", "200"]
            } else {
                if (indexes.length < 2) {
                    indexes.push(components.indexOf(word));
                    // string = [3, 1]
                }
            }
        }

        if (indexes.length != 2) continue;

        // construir camada

        // adicionar classe de subprocesso na camada se houver
        let sliceClasses = ["field-slice"];
        if (sub != undefined) {
            sliceClasses.push(sub);
        }

        let slice = generateElement({
            classes: sliceClasses
        });

        field.appendChild(slice);

        // construir componentes

        for (comp of components) {
            let tempComp = generateElement({
                classes: ["field-component"],
                attrib: [["data-name",comp]]
            })
            let lifeline = generateElement({
                classes: ["field-component__lifeline",
                    "field-component__lifeline--full"]
            });
            tempComp.appendChild(lifeline);
            slice.appendChild(tempComp);
        }

        // construir seta

        let dir;

        if (indexes[0] < indexes[1]) dir = "arrow--right";
        else dir = "arrow--left";

        let tempArrow = generateElement({
            classes: ["arrow-new", dir],
            content: `<span class="arrow__label">${string}</span>`,
            props: [["--begin",indexes[0]], ["--end",indexes[1]]]
        });

        slice.appendChild(tempArrow);
    }

    for (s of subs) {
        let members = Array.from(document.querySelectorAll(`.${s}`));
        
        let subHeader = generateElement({
            classes: ["sub-header"],
            attrib: [["data-name",s]],
            content: `${s}`
        });

        field.insertBefore(subHeader, members[0]);

        subHeader.addEventListener("click", () => {
            subHeader.classList.toggle("collapsed");
            for (member of members) member.classList.toggle("collapsed");
        })
    }
}

editar.addEventListener("click", () => {
    editor.removeAttribute("readonly");
    editar.setAttribute("disabled", "true");
});

gerar.addEventListener("click", () => {
    gen();
});

gen();