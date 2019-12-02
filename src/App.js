import React, {useState} from 'react';
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
  let lineas2=lineas.map(item => {
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

  }
  function parser(token){
    console.log(token);

    let parseo = [];
    let buffer = {};
    let errores = [];
    let salto = 0;
    for (let i = 0; i < token.length; i++) {
      switch (token[i].value) {
        case "RESERVADA":
          switch(token[i].name){
            case "num":
              console.log("NUM")
              break;
            case "cad":
              console.log("CAD")
              break;
          }
          break;
      

      }

    }
  }
  function lexer(code){
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
    const resWords = ["num", "imp", "it", "cad", "smn", "for"];
    
    for (let i = 0; i < code.length; i++) {
      if(code.charAt(i)===";"&&state===0){
        state=1;
        buffer={value: "PUNTO Y COMA", name: ";"};
      }
      else if (code.charAt(i)==='='&&state===0) {
        state=1;
        i++;
        if (code.charAt(i)==='=') {
          state=2;
          buffer={value: "COMPARACION", name: "=="};
        }
        else{
          i--;
          state=2;
          buffer={VALUE:"ASIGNACION", name: "="};
        }
      }
      else if (code.charAt(i) === '<' && state === 0){
          state = 1;
          i++;
          if (code.charAt(i) === '=')
          {
            state=1;
            buffer={value: "MENOR O IGUAL", name: "<="};
          }
          else if (code.charAt(i) === '>')
          {
            state=1;
            buffer={value: "DIFERENTE", name: "<>"};
          }
          else
          {
            state=1;
            buffer={value: "MENOR QUE", name: "<"};
          }
      }
      else if(code.charAt(i)==="("&&state===0){
        state=1;
        buffer={value: "ABRE PARENTESIS", name: "("};
      }
      else if(code.charAt(i)===")"&&state===0){
        state=1;
        buffer={value: "CIERRA PARENTESIS", name: ")"};
      }
      else if(code.charAt(i)==="{"&&state===0){
        state=1;
        buffer={value: "ABRE LLAVES", name: "{"};
      }
      else if(code.charAt(i)==="}"&&state===0){
        state=1;
        buffer={value: "CIERRA LLAVES", name: "}"};
      }
      else if(code.charAt(i)===":"&&state===0){
        state=1;
        buffer={value: "DOS PUNTOS", name: ":"};
      }
      else if(code.charAt(i)==="+"&&state===0){
        state = 1;
        i++;
        if (code.charAt(i)==="+") {
          state=1;
          buffer={value: "INCREMENTO", name: "++"};
        } else {
          state=1;
          buffer={value: "SUMA", name: "+"};
        }
      }
      else if(code.charAt(i)==="-"&&state===0){
        state = 1;
        i++;
        if (code.charAt(i)==="-") {
          state=2;
          buffer={value: "DECREMENTO", name: "--"};
        } else {
          state=1;
          buffer={value: "RESTO", name: "-"};
        }
      }
      else if(code.charAt(i)==="*"&&state===0){
        state=1;
        buffer={value: "MULTIPLICACION", name: "*"};
      }
      else if(code.charAt(i)==="/"&&state===0){
        state=1;
        buffer={value: "DIVISION", name: "/"};
      }
      else if(num.test(code.charAt(i))){
        state=1;
        buffer="";
        buffer+=code.charAt(i);
        i++;
        while (num.test(code.charAt(i))||code.charAt(i)===".") {
          buffer+= code.charAt(i);
          i++;
        }
        if(punto.test(buffer)){
          buffer={value: "FLOTANTE", name: "1.1"};
        } 
        else if(entero.test(buffer)){
          buffer={value: "ENTERO", name: "1"};
        } else {
          state=0;
        }
        i--;
      }
      else if(letter.test(code.charAt(i))){
        state = 1;
        buffer += code.charAt(i);
        i++;
        while(letter.test(code.charAt(i))){
          buffer += code.charAt(i);
          i++;
        }
        i--;
        if(resWords.includes(buffer)){
          state=2;
          buffer={value: "RESERVADA", name: buffer};
        } else {
          state=2;
          buffer={value: "IDENTIFICADOR", name: buffer};
                  
        }

      }
      else if(code.charAt(i)===" "&&state===0){
        state=1; 
      }
      else if (code.charAt(i).match(/\n/g)&&state===0) {
        state=1;
        buffer="SALTO"
        count++;
      }

     if(state!==0){
        arr.push(buffer);
        buffer="";
        state=0;
      } else {
        errors.push(count+1);
        index.push(i);
        state=0;
        buffer="";
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
              onChange={(e)=>update(e)}
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
                {eLexemas.map((item, i)=>(
                  <div key={i}>
                  <p>Error en linea {item} el simbolo <span style={{color: "red"}}> {raw.charAt(indLex[i])}</span> no esta permitido</p>
                  <p style={{color: "orange"}}>{lineas2[item-1]}</p>
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
