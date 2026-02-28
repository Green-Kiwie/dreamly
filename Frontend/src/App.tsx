import {wrapper} from './Wrapper'
import {form} from './form'
import './App.css'

function App() {
  return (
    <>
      <div id="background">
        <div id="titleWrapper">
          <h1> Dreamly </h1>
        </div>
        
        <div id="meat">
          {wrapper()}
          {form()}
        </div>

      </div>
    </>
  )
}

export default App
