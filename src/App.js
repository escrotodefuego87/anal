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
    setLexemas([]); setEllex([]); setIndlex([]);
    setLexemas(lexer(raw.trim()).lexemas);
    setEllex(lexer(raw.trim()).errores);
    setIndlex(lexer(raw.trim()).index);
    parser(lexemas.filter(Boolean));
    // evaluar(lexemas.filter(Boolean));

  }
  function parser(token) {
    console.log("Tokens", token);

    token.push("end");
    let evaluar = "";
    let parseo = [];
    let buffer = {};
    let errores = [];
    let err = {};
    let nombre = "";
    let salto = 0;
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
                  buffer = { value: "DECLARACION", type: "num", name: nombre }
                }
                else if (token[i].name === "ASIGNACION") {
                  i++;
                  if (token[i].name === "ENTERO" || token[i].name === "IDENTIFICADOR" || token[i].name === "FLOTANTE") {
                    (token[i].name === "FLOTANTE") ? evaluar = "it" : evaluar = "num";
                    (token[i].name === "IDENTIFICADOR") ? evaluar = token[i].value : evaluar = "num";
                    i++;
                    while (token[i].name === "ENTERO" || token[i].name === "FLOTANTE" || token[i].value === '+' || token[i].value === '-' || token[i].value === '*' || token[i].value === '/') {
                      i++;
                      if (token[i].name === "FLOTANTE" || token[i].name === 'DIVISION') { evaluar = "it" }
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
            case "cad":
              i++;
              if (token[i].value === "IDENTIFICADOR") {
                nombre = token[i].name;
                i++;
                if (token[i].value === "PUNTO Y COMA") {
                  buffer = { value: "DECLARACION", type: "cad", name: nombre }
                }
                else if (token[i].value === "ASIGNACION") {
                  i++;
                  if (token[i].value === "DOS PUNTOS") {
                    i++;
                    if (token[i].value === "IDENTIFICADOR") {

                      i++;
                      while (token[i].value === "IDENTIFICADOR") {
                        i++;
                      }
                      if (token[i].value === "DOS PUNTOS") {
                        i++;
                        if (token[i].value === "PUNTO Y COMA") {
                          buffer = { value: "DECLARACION", type: "cad", name: nombre }

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
                }

                else {
                  err = { error: ";", linea: salto, token: nombre }
                  i--;
                  break;
                }

              } else {
                err = { error: "identificador", linea: salto, token: token[i - 1].name }
                i--;
                break;
              }
              break;

          }
          break;
        case "IDENTIFICADOR":
          i++;
          switch (token[i].value) {
            case "COMPARACION":
              i++;
              if (token[i].value === "IDENTIFICADOR" || token[i].value === "ENTERO" || token[i] === "FLOTANTE") {
                buffer = { value: "SENTENCIA", type: "IGUALACION" }

              }
              break;
            case "MAYOR O IGUAL":
              i++;
              if (token[i].value === "IDENTIFICADOR" || token[i].value === "ENTERO" || token[i] === "FLOTANTE") {
                buffer = { value: "SENTENCIA", type: "MAYOR O IGUAL" }

              }
              break;
            case "DIFERENTE":
              i++;
              if (token[i].value === "IDENTIFICADOR" || token[i].value === "ENTERO" || token[i] === "FLOTANTE") {
                buffer = { value: "SENTENCIA", type: "DIFERENTE" }

              }
              break;
          }
          break;

      }

      parseo.push(buffer);
      errores.push(err);
      buffer = {};
      err = {};
      nombre = "";



    }
    console.log("Output", parseo.filter(value => Object.keys(value).length !== 0));
    console.log("Errores", errores.filter(value => Object.keys(value).length !== 0));

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
      else if (code.charAt(i) === ":" && state === 0) {
        state = 1;
        buffer = { name: "DOS PUNTOS", value: ":" };
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
    return {
      lexemas: arr,
      errores: errors,
      index: index
    };

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
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.container}>
                  <p>Errores semanticos</p>
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
