import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import './App.css';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    outline: "none"
  },
  container: {
    padding: "20px",
    margin: "10px"
  }
}));


function App() {
  const classes = useStyles();
  const [raw, setRaw] = useState("");
  const [lexemas, setLexemas] = useState([]);
  const [eLexemas, setEllex] = useState([]);
  const [indLex, setIndlex] = useState([]);
  const [sin, setSin] = useState([]);
  const [sinE, setSinE] = useState([]);
  const [erroresIf, setEif] = useState([]);
  const [semantico, setSem] = useState([]);


  let lineas = [];
  lineas = raw.split("\n");
  let lineas2 = lineas.map(item => {
    return item.replace(/\n/g, "");
  })
  lineas2.pop();

  const update = (e) => {
    setRaw(e.target.value)
  }
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }


  const compilar = () => {

    lexer(raw);
    parser(lexemas.filter(Boolean));
    semantic(sin);
    console.log("Lexemas ", lexemas.filter(Boolean));
    // console.log("Declaraciones ", sin);

  }
  function semantic(items){
    let declaraciones = [];
    let declaraciones2 = [];
    let errores = [];

    let iz=[{type:"a"}], der=[{type:"b"}];
  
    const letter = /^[a-zA-Z]+$/;
    const num = /^[0-9]+$/;


    items.forEach(element => {
       
      if(element.value === "DECLARACION"){
        if(declaraciones2.includes(element.name)){
          errores.push("la variable "+element.name+" ya ha sido declarada");

        }
        else if(element.type === element.obtained) {
          declaraciones.push(element);
          declaraciones2.push(element.name);
        }
        else if(element.obtained !== "num"&&element.obtained !== "it"&&element.obtained !== "cad"){
          if(declaraciones.includes(element.obtained)){

          }else{
            errores.push("la variable "+element.obtained+" no ha sido declarada");
          }
        }
        else{
          errores.push("se esperaba un valor tipo "+element.type+" pero se encontro "+element.obtained+ " en la variable "+element.name)
        }
      }
      else if(element.value === "SENTENCIA"){
        iz = declaraciones.filter(val => {return val.name === element.left});
        der = declaraciones.filter(val => {return val.name === element.right});
        // console.log("ia me arto", iz[0], der[0])

        if(!declaraciones2.includes(element.left)&&letter.test(element.left)){
          errores.push("la variable "+element.left+ " no existe en el contexto actual")
        }
        if(!declaraciones2.includes(element.right)&&letter.test(element.right)){
          errores.push("la variable "+element.right+ " no existe en el contexto actual")
        }

        if(num.test(element.right)){
          if(element.mid !== "==" && element.mid !== "<>"){
            if(iz[0].type==="cad"){
              errores.push("se esperaba que las variables "+element.left+" y "+element.right+" fueran numericas")
            }
          }
        }
        else if(iz[0].type===der[0].type){
          if(element.mid !== "==" && element.mid !== "<>"){
            if(iz[0].type==="cad"||der[0].type==="cad"){
              errores.push("se esperaba que las variables "+element.left+" y "+element.right+" fueran numericas")
            }
          }
        }
        else{
          errores.push("no se pueden comparar "+iz[0].type+" y "+der[0].type+" entre si")
        }
      }
    });

    setSem(errores);
  }
  function parser(token) {

    token.push({name:"END", value:0});
    token.push({name:"END", value:0});
    console.log(token)
    let evaluar = "";
    let parseo = [];
    let buffer = {};
    let errores = [];
    let erroresIf = [];
    let err = {};
    let nombre = "";
    let salto = 0;
    const num = /^[0-9]+$/;

    for (let i = 0; i < token.length; i++) {

      switch (token[i].name) {
        case "RESERVADA":
          switch (token[i].value) {
            case "num":
              i++;
              if (token[i].name === "IDENTIFICADOR") {
                nombre = token[i].value;
                i++;
                if (token[i].name === "PUNTO Y COMA") {
                  buffer = { value: "DECLARACION", type: "num", name: nombre, obtained: "num" }
                }
                else if (token[i].name === "ASIGNACION") {
                  i++;
                  if (token[i].name === "ENTERO" || token[i].name === "IDENTIFICADOR" || token[i].name === "FLOTANTE") {
                    if (token[i].name === "FLOTANTE") evaluar = "it"
                    if (token[i].name === "IDENTIFICADOR") evaluar = token[i].value
                    if (token[i].name === "ENTERO") evaluar = "num"

                    i++;
                    while (token[i].name === "ENTERO" || token[i].name === "FLOTANTE" || token[i].value === '+' || token[i].value === '-' || token[i].value === '*' || token[i].value === '/') {
                      if (token[i].name === "FLOTANTE" || token[i].name === 'DIVISION') { evaluar = "it" }
                      i++;
                    }
                    if (token[i].name === "PUNTO Y COMA") {
                      buffer = { value: "DECLARACION", type: "num", name: nombre, obtained: evaluar }
                    }
                    else {
                      err = {
                        error: ";",
                        linea: salto,
                        token: token[i - 1].value
                      }
                      i--;
                      break;
                    }
                  }
                  else if (token[i].name === "DOS PUNTOS") {
                    i++;
                    if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                      while (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                        i++;
                      }
                      if (token[i].name === "DOS PUNTOS") {
                        i++;
                        if (token[i].name === "PUNTO Y COMA") {
                          buffer = { value: "DECLARACION", type: "num", name: nombre, obtained: "cad" }
                        }
                        else {
                          err = {
                            error: ";",
                            linea: salto,
                            token: token[i - 1].value
                          }
                        }
                      }
                      else {
                        err = {
                          error: "identificador",
                          linea: salto,
                          token: token[i - 1].value
                        }
                      }
                    }
                  }
                  else {
                    err = {
                      error: "identificador",
                      linea: salto,
                      token: token[i - 1].value
                    }
                    i--;
                    break;
                  }

                }
                else {
                  err = {
                    error: ";",
                    linea: salto,
                    token: nombre
                  }
                  i--;
                  break;
                }
              }
              else {
                err = {
                  error: "identificador",
                  linea: salto,
                  token: token[i - 1].value
                }
                i--;
                break;
              }
              break;
            case "cad":
              i++;
              if (token[i].name === "IDENTIFICADOR") {
                nombre = token[i].value;
                i++;
                if (token[i].name === "PUNTO Y COMA") {
                  buffer = { value: "DECLARACION", type: "cad", name: nombre, obtained: "cad" }
                }
                else if (token[i].name === "ASIGNACION") {
                  i++;
                  if (token[i].name === "DOS PUNTOS") {
                    i++;
                    if (token[i].name === "IDENTIFICADOR") {
                      i++;
                      while (token[i].name === "IDENTIFICADOR") {
                        i++;
                      }
                      if (token[i].name === "DOS PUNTOS") {
                        i++;
                        if (token[i].name === "PUNTO Y COMA") {
                          buffer = { value: "DECLARACION", type: "cad", name: nombre, obtained: "cad" }

                        }
                        else {
                          err = { error: ";", linea: salto, token: token[i - 1].name }
                          i--;
                          break;
                        }
                      }
                      else {
                        err = { error: ":", linea: salto, token: token[i - 1].name }
                        i--;
                        break;
                      }
                    }

                  }
                  else if (token[i].name === "ENTERO" || token[i].name === "IDENTIFICADOR" || token[i].name === "FLOTANTE") {
                    if (token[i].name === "FLOTANTE") evaluar = "it"
                    if (token[i].name === "IDENTIFICADOR") evaluar = token[i].value
                    if (token[i].name === "ENTERO") evaluar = "num"

                    i++;
                    while (token[i].name === "ENTERO" || token[i].name === "FLOTANTE" || token[i].value === '+' || token[i].value === '-' || token[i].value === '*' || token[i].value === '/') {
                      if (token[i].name === "FLOTANTE" || token[i].name === 'DIVISION') { evaluar = "it" }
                      i++;
                    }
                    if (token[i].name === "PUNTO Y COMA") {
                      buffer = { value: "DECLARACION", type: "cad", name: nombre, obtained: evaluar }
                    }
                    else {
                      err = {
                        error: ";",
                        linea: salto,
                        token: token[i - 1].value
                      }
                      i--;
                      break;
                    }
                  }
                  else {
                    err = { error: "identificador", linea: salto, token: nombre }
                  }
                }
                else {
                  err = { error: ";", linea: salto, token: nombre }
                  i--;
                  break;
                }

              }
              else {
                err = { error: "identificador", linea: salto, token: token[i - 1].name }
                i--;
                break;
              }
              break;
            case "it":
              i++;
              if (token[i].name === "IDENTIFICADOR") {
                nombre = token[i].value;
                i++;
                if (token[i].name === "PUNTO Y COMA") {
                  buffer = { value: "DECLARACION", type: "it", name: nombre, obtained: "it" }
                }
                else if (token[i].name === "ASIGNACION") {
                  i++;
                  if (token[i].name === "ENTERO" || token[i].name === "IDENTIFICADOR" || token[i].name === "FLOTANTE") {
                    if (token[i].name === "FLOTANTE") evaluar = "it"
                    if (token[i].name === "IDENTIFICADOR") evaluar = token[i].value
                    if (token[i].name === "ENTERO") evaluar = "num"

                    i++;
                    while (token[i].name === "ENTERO" || token[i].name === "FLOTANTE" || token[i].value === '+' || token[i].value === '-' || token[i].value === '*' || token[i].value === '/'|| token[i].name==="IDENTIFICADOR") {
                      if (token[i].name === "FLOTANTE" || token[i].name === 'DIVISION') { evaluar = "it" }
                      i++;
                    }
                    if (token[i].name === "PUNTO Y COMA") {
                      buffer = { value: "DECLARACION", type: "it", name: nombre, obtained: evaluar }
                    }
                    else {
                      err = {
                        error: ";",
                        linea: salto,
                        token: token[i - 1].value
                      }
                      i--;
                      break;
                    }
                  }
                  else if (token[i].name === "DOS PUNTOS") {
                    i++;
                    if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                      while (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                        i++;
                      }
                      if (token[i].name === "DOS PUNTOS") {
                        i++;
                        if (token[i].name === "PUNTO Y COMA") {
                          buffer = { value: "DECLARACION", type: "it", name: nombre, obtained: "cad" }
                        }
                        else {
                          err = {
                            error: ";",
                            linea: salto,
                            token: token[i - 1].value
                          }
                        }
                      }
                      else {
                        err = {
                          error: "identificador",
                          linea: salto,
                          token: token[i - 1].value
                        }
                      }
                    }
                  }
                  else {
                    err = {
                      error: "identificador",
                      linea: salto,
                      token: token[i - 1].value
                    }
                    i--;
                    break;
                  }

                }
                else {
                  err = {
                    error: ";",
                    linea: salto,
                    token: nombre
                  }
                  i--;
                  break;
                }
              } else {
                err = {
                  error: "identificador",
                  linea: salto,
                  token: token[i - 1].value
                }
                i--;
                break;
              }
              break;
            case "smn":
              i++;
              if (token[i].name === "ABRE PARENTESIS") {
                buffer = { value: "if", type: 1, linea: salto }
              }
              break;
            case "then":
              i++;
              if (token[i].name === "MENOR QUE") {
                i++;
                if (token[i].name === "AMPERSAND") {
                  buffer = { value: "else", type: 1, linea: salto }
                }
              }

              break;

          }
          break;
        case "IDENTIFICADOR":
          let iden = "";
          let fantasy = [];
          iden = token[i].value;
          i++;
          switch (token[i].name) {
            case "ASIGNACION":            
              i++;
                if((token[i+1].name!=="SALTO"&&token[i+1].name!=="END"&&token[i+1].name !== "PUNTO Y COMA")&&(token[i].name === "ENTERO"||token[i].name === "FLOTANTE"||token[i].name === "IDENTIFICADOR"||token[i].name === "CADENA")){
                  while (token[i].name==="CADENA"||token[i].name === "ENTERO"||token[i].name === "FLOTANTE"||token[i].name === "IDENTIFICADOR"||token[i].value === "+"||token[i].value === "-"||token[i].value === "*"||token[i].value === "/") {
                    fantasy.push(token[i].value);
                    i++;
                  }
                  if(token[i].name === "PUNTO Y COMA"){
                    buffer = {type: "ASIGNACION", name:iden, data: fantasy }
                    console.log(buffer)
                  }
                  else {
                    err = {
                      error: ";",
                      linea: salto,
                      token: token[i-1].value

                    }
                    console.log(err)
                  }
                }
                else if(token[i].name === "ENTERO"){
                  i++;
                  if(token[i].name === "PUNTO Y COMA"){
                    buffer = {type: "ASIGNACION", name:iden, data: token[i-1].value}
                    console.log(buffer);
                  }
                  else {
                    err = {
                      error: ";",
                      linea: salto,
                      token: token[i - 1].value
                      
                    }
                  }
                }
                else if(token[i].name === "FLOTANTE"){
                  i++;
                  if(token[i].name === "PUNTO Y COMA"){
                    buffer = {type: "ASIGNACION", name:iden, data: token[i-1].value}
                  }
                  else {
                    err = {
                      error: ";",
                      linea: salto,
                      token: token[i - 1].value
                      
                    }
                  }
                }
                else if(token[i].name === "CADENA"){
                  i++;
                  if(token[i].name === "PUNTO Y COMA"){
                    buffer = {type: "ASIGNACION", name:iden, data: token[i-1].value}
                    console.log(buffer)
                  }
                  else {
                    err = {
                      error: ";",
                      linea: salto,
                      token: token[i - 1].value
                      
                    }
                  }
                }
                else if(token[i].name === "IDENTIFICADOR"){
                  i++;
                  if(token[i].name === "PUNTO Y COMA"){
                    buffer = {type: "ASIGNACION", name:iden, data: token[i-1].value}
                  }
                  else {
                    err = {
                      error: ";",
                      linea: salto,
                      token: token[i - 1].value
                      
                    }
                  }
                }
                else {
                  err = {
                    error: "valor",
                    linea: salto,
                    token: token[i-1].value
                  }
                }
                
            break;
            case "COMPARACION":
              i++;
              if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO" || token[i].name === "FLOTANTE") {
                buffer = { value: "SENTENCIA", left: token[i - 2].value, mid: token[i - 1].value, right: token[i].value }
                break;
              }
              else if (token[i].name === "DOS PUNTOS") {
                i++;
                if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                  while (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                    i++;
                  }
                  if (token[i].name === "DOS PUNTOS") {
                    buffer = { value: "SENTENCIA", left: token[i - 4].value, mid: "==", right: "CADENA" }
                  }
                  else {
                    err = {
                      error: "cierre cadena",
                      linea: salto,
                      token: token[i - 1].value
                    }
                  }
                }
                else {
                  err = {
                    error: "identificador",
                    linea: salto,
                    token: token[i - 1].value
                  }
                }
              }
              else {
                err = {
                  error: "identificador",
                  linea: salto,
                  token: token[i - 1].value
                }
                i--;
              }
              break;
            case "MENOR QUE":
              i++;
              if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO" || token[i].name === "FLOTANTE") {
                buffer = { value: "SENTENCIA", left: token[i - 2].value, mid: token[i - 1].value, right: token[i].value }
                break;
              }
              else if (token[i].name === "DOS PUNTOS") {
                i++;
                if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                  while (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                    i++;
                  }
                  if (token[i].name === "DOS PUNTOS") {
                    buffer = { value: "SENTENCIA", left: token[i - 4].value, mid: "<", right: "CADENA" }
                  }
                  else {
                    err = {
                      error: "cierre cadena",
                      linea: salto,
                      token: token[i - 1].value
                    }
                  }
                }
                else {
                  err = {
                    error: "identificador",
                    linea: salto,
                    token: token[i - 1].value
                  }
                }
              }
              else {
                err = {
                  error: "identificador",
                  linea: salto,
                  token: token[i - 1].value

                }
                i--;
                break;
              }
              break;
            case "MAYOR QUE":
              i++;
              if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO" || token[i].name === "FLOTANTE") {
                buffer = { value: "SENTENCIA", left: token[i - 2].value, mid: token[i - 1].value, right: token[i].value }
                break;
              }
              else if (token[i].name === "DOS PUNTOS") {
                i++;
                if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                  while (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                    i++;
                  }
                  if (token[i].name === "DOS PUNTOS") {
                    buffer = { value: "SENTENCIA", left: "IDENTIFICADOR", mid: ">", right: "CADENA" }
                  }
                  else {
                    err = {
                      error: "cierre cadena",
                      linea: salto,
                      token: token[i - 1].value
                    }
                  }
                }
                else {
                  err = {
                    error: "identificador",
                    linea: salto,
                    token: token[i - 1].value
                  }
                }
              }
              else {
                err = {
                  error: "identificador",
                  linea: salto,
                  token: token[i - 1].value
                }
                i--;
              }
              break;
            case "DIFERENTE":
              i++;
              if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO" || token[i].name === "FLOTANTE") {
                buffer = { value: "SENTENCIA", left: token[i - 2].value, mid: token[i - 1].value, right: token[i].value }
                break;
              }
              else if (token[i].name === "DOS PUNTOS") {
                i++;
                if (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                  while (token[i].name === "IDENTIFICADOR" || token[i].name === "ENTERO") {
                    i++;
                  }
                  if (token[i].name === "DOS PUNTOS") {
                    buffer = { value: "SENTENCIA", left: token[i - 4].value, mid: "<>", right: "CADENA" }
                  }
                  else {
                    err = {
                      error: "cierre cadena",
                      linea: salto,
                      token: token[i - 1].value
                    }
                  }
                }
                else {
                  err = {
                    error: "identificador",
                    linea: salto,
                    token: token[i - 1].value
                  }
                }
              }
              else {
                err = {
                  error: "identificador",
                  linea: salto,
                  token: token[i - 1].value
                }
                i--;
              }
              break;
          }
          break;
        case "CIERRA PARENTESIS":
          i++;
          if (token[i].name === "ABRE LLAVES") {
            buffer = { value: "if", type: 2, linea: salto }
          }
          else {
            err = { error: "{", linea: salto, token: token[i - 1].name }
          }
          break;
        case "CIERRA LLAVES":
          buffer = { value: "if", type: 3, linea: salto }

          break;
        case "DIVISION":
          i++;
          if (token[i].name === "MAYOR QUE") {
            buffer = { value: "else", type: 2, linea: salto }
          }
          break;
        case "SALTO":
          salto++;
          break;

      }

      parseo.push(buffer);
      errores.push(err);
      buffer = {};
      err = {};
      nombre = "";

    }

    parseo = parseo.filter(value => Object.keys(value).length !== 0)
    errores = errores.filter(value => Object.keys(value).length !== 0)

    parseo.push("end")
    let salto2=0;
    for(let i=0;i<parseo.length;i++){
      if(parseo[i].value === "if" && parseo[i].type === 1){
        i++;
        if(parseo[i].value === "SENTENCIA"){
          salto2=parseo[i-1].linea;
          i++;
          if(parseo[i].value === "if" && parseo[i].type === 2){
            i++;
            while(parseo[i].value === "DECLARACION"){
              if(parseo[i].value === "SENTENCIA"){
                erroresIf.push({error:"se esperaba declaracion", linea:salto2});
              }
              i++;
            }
            if(parseo[i].value === "if" && parseo[i].type === 3){
              i++;
              if(parseo[i].value === "else" && parseo[i].type === 1){
                i++;
                salto2=token[i-1].linea;
                while(parseo[i].value === "DECLARACION"){
                  if(parseo[i].value === "SENTENCIA"){
                    erroresIf.push({error:"se esperaba declaracion", linea:salto2});
                  }
                  i++;
                  if(parseo[i].value === "else" && parseo[i].type === 2){

                  }
                  else {
                    erroresIf.push({error:"se esperaba cierre de then", linea:salto2});
                    alert("f");
                  }
                }
              }
            }
            else {
              erroresIf.push({error:"se esperaba cierre de smn", linea:salto2});
            }
            
          }
          else {
            erroresIf.push({error:"se esperaba )", linea:salto2});
          }
        }
        else{
          erroresIf.push({error:" sentencia valida dentro del smn", linea:salto2});
        }
      }


 
    }

    setSin(parseo);
    setSinE(errores);
    setEif(erroresIf);

  }
  function lexer(code) {
    let arr = [];
    let state = 0;
    let errors = [];
    let index = [];
    let buffer = "";
    let count = 0;

    const num = /[0-9]/;
    const letter = /^[a-zA-Z]+$/;
    const miroz=/^[a-zA-Z0-9, ]*$/
    const punto = /^\d+\.\d{0,9}$/;
    const entero = /^\d*$/;
    const resWords = ["num", "imp", "it", "cad", "smn", "for", "then"];

    for (let i = 0; i < code.length; i++) {
      if (code.charAt(i) === ";" && state === 0) {
        state = 1;
        buffer = { name: "PUNTO Y COMA", value: ";" };
      }
      else if (code.charAt(i) === '=' && state === 0) {
        state = 1;
        i++;
        if (code.charAt(i) === '=') {
          state = 2;
          buffer = { name: "COMPARACION", value: "==" };
        }
        else {
          i--;
          state = 2;
          buffer = { name: "ASIGNACION", value: "=" };
        }
      }
      else if (code.charAt(i) === '<' && state === 0) {
        state = 1;
        i++;
        if (code.charAt(i) === '=') {
          state = 1;
          buffer = { name: "MENOR O IGUAL", value: "<=" };
        }
        else if (code.charAt(i) === '>') {
          state = 1;
          buffer = { name: "DIFERENTE", value: "<>" };
        }
        else {
          state = 1;
          buffer = { name: "MENOR QUE", value: "<" };
          i--;
        }
      }
      else if (code.charAt(i) === '>' && state === 0) {
        state = 1;
        i++;
        if (code.charAt(i) === '=') {
          state = 1;
          buffer = { name: "MAYOR O IGUAL", value: ">=" };
        }
        else {
          state = 1;
          buffer = { name: "MAYOR QUE", value: ">" };
          i--;
        }
      }
      else if (code.charAt(i) === "(" && state === 0) {
        state = 1;
        buffer = { name: "ABRE PARENTESIS", value: "(" };
      }
      else if (code.charAt(i) === ")" && state === 0) {
        state = 1;
        buffer = { name: "CIERRA PARENTESIS", value: ")" };
      }
      else if (code.charAt(i) === "{" && state === 0) {
        state = 1;
        buffer = { name: "ABRE LLAVES", value: "{" };
      }
      else if (code.charAt(i) === "}" && state === 0) {
        state = 1;
        buffer = { name: "CIERRA LLAVES", value: "}" };
      }
      else if (code.charAt(i) === "&" && state === 0) {
        state = 1;
        buffer = { name: "AMPERSAND", value: "&" };
      }
      else if (code.charAt(i) === ":" && state === 0) {
        state = 1;
        i++;
        while(miroz.test(code.charAt(i))){
          i++
        }
        if(code.charAt(i) === ":" && state===1){
          buffer = { name: "CADENA", value: ":" };

        }
      }
      else if (code.charAt(i) === "+" && state === 0) {
        state = 1;
        i++;
        if (code.charAt(i) === "+") {
          state = 1;
          buffer = { name: "INCREMENTO", value: "++" };
        } else {
          state = 1;
          buffer = { name: "SUMA", value: "+" };
        }
        i--;
      }
      else if (code.charAt(i) === "-" && state === 0) {
        state = 1;
        i++;
        if (code.charAt(i) === "-") {
          state = 2;
          buffer = { name: "DECREMENTO", value: "--" };
        } else {
          state = 1;
          buffer = { name: "RESTA", value: "-" };
        }
        i--;
      }
      else if (code.charAt(i) === "*" && state === 0) {
        state = 1;
        buffer = { name: "MULTIPLICACION", value: "*" };
      }
      else if (code.charAt(i) === "/" && state === 0) {
        state = 1;
        buffer = { name: "DIVISION", value: "/" };
      }
      else if (num.test(code.charAt(i))) {
        state = 1;
        buffer = "";
        buffer += code.charAt(i);
        i++;
        while (num.test(code.charAt(i)) || code.charAt(i) === ".") {
          buffer += code.charAt(i);
          i++;
        }
        if (punto.test(buffer)) {
          buffer = { name: "FLOTANTE", value: parseFloat(buffer, 10) };
        }
        else if (entero.test(buffer)) {
          buffer = { name: "ENTERO", value: parseInt(buffer, 10) };
        } else {
          state = 0;
        }
        i--;
      }
      else if (letter.test(code.charAt(i))) {
        state = 1;
        buffer += code.charAt(i);
        i++;
        while (letter.test(code.charAt(i)) || num.test(code.charAt(i))) {
          buffer += code.charAt(i);
          i++;
        }
        i--;
        if (resWords.includes(buffer)) {
          state = 2;
          buffer = { name: "RESERVADA", value: buffer };
        } else {
          state = 2;
          buffer = { name: "IDENTIFICADOR", value: buffer };

        }

      }
      else if (code.charAt(i) === " " && state === 0) {
        state = 1;
      }
      else if (code.charAt(i).match(/\n/g) && state === 0) {
        state = 1;
        buffer = { name: "SALTO", value: 1 }
        count++;
      }

      if (state !== 0) {
        arr.push(buffer);
        buffer = "";
        state = 0;
      } else {
        errors.push(count + 1);
        index.push(i);
        state = 0;
        buffer = "";
      }

    }
    // return {
    //   lexemas: arr,
    //   errores: errors,
    //   index: index
    // };

    setLexemas(arr);
    setEllex(errors);
    setIndlex(index);

  }

  return (
    <div className="App">
      <header className="App-header">
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper className={classes.container}>
              <p>Code</p>
              <Button color="primary" onClick={compilar} fullWidth variant="contained">Compilar</Button>
              <TextField
                onChange={(e) => update(e)}
                id="standard-multiline-static"
                multiline
                rows="30"
                margin="normal"
                fullWidth
                className={classes.textField}
                variant="outlined"
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper className={classes.container}>
                  <p>Errores lexicos</p>
                  {eLexemas.map((item, i) => (
                    <div key={i}>
                      <p>Error en linea {item} el simbolo <span style={{ color: "red" }}> {raw.charAt(indLex[i])}</span> no esta permitido</p>
                      <p style={{ color: "orange" }}>{lineas2[item - 1]}</p>
                    </div>
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.container}>
                  <p>Errores sintacticos</p>
                  {
                    sinE.map((item, i) => (
                      <div key={i}>
                <p>Error en linea {item.linea + 1} se esperaba <span style={{ color: "red" }}> {item.error}</span> despues de: {item.token}</p>
                      </div>
                    ))
                    
                  }
                  {
                    erroresIf.filter(onlyUnique).map((item, i) => (
                      <div key={i}>
                <p>Error en linea {item.linea} se esperaba <span style={{ color: "red" }}> {item.error}</span></p>
                      </div>
                    ))
                  }
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.container}>
                  <p>Errores semanticos</p>
                  {semantico.map((item, i) => (
                    <div key={i}>
                      <p>{item}</p>
                    </div>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </header>
    </div>
  );
}

export default App;
