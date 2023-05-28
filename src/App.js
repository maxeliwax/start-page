import { useState, useEffect } from "react";
import { ref, getDownloadURL, uploadBytesResumable, listAll } from "firebase/storage";
import { storage } from "./firebase";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link, NavLink } from "react-router-dom";
import AboutPage from "./AboutPage.js";

function App() {
  const [progress, setProgress] = useState(0);
  const [downloadURLs, setDownloadURLs] = useState([]);

  useEffect(() => {
    if (downloadURLs.length > 0) {
      // Perform any additional actions with the download URLs here
      console.log("Files available:", downloadURLs);
    }
  }, [downloadURLs]);

  useEffect(() => {
    fetchDownloadURLs();
  }, []);

  const fetchDownloadURLs = () => {
    // Fetch the download URLs of the uploaded files from Firebase Storage
    const filesRef = ref(storage, "files");
    const listAllPromise = listAll(filesRef);

    listAllPromise
      .then((res) => {
        const promises = res.items.map((itemRef) => getDownloadURL(itemRef));
        Promise.all(promises)
          .then((urls) => {
            setDownloadURLs(urls);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const formHandler = (e) => {
    e.preventDefault();
    const files = Array.from(e.target[0].files);
    uploadFiles(files);
  };

  const uploadFiles = (files) => {
    if (!files || files.length === 0) return;

    const uploadPromises = files.map((file) => {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(prog);
          },
          (error) => {
            console.log(error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    });

    Promise.all(uploadPromises)
      .then((urls) => {
        setDownloadURLs((prevURLs) => [...prevURLs, ...urls]); // Concatenate new URLs with existing URLs
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Router>
      <div className="App">
        <h1>moaaaaanke paradise</h1>
        <h1>share the best Pictures with monke</h1>
        <ul className="nav-links">
          <li>
            <NavLink exact to="/" activeClassName="active-link">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" activeClassName="active-link">
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/monkey-types" activeClassName="active-link">
              Monkey Types
            </NavLink>
          </li>
          <li>
            <NavLink to="/monkey-parks" activeClassName="active-link">
              Monkey Parks
            </NavLink>
          </li>
          <li>
            <NavLink to="/zoos" activeClassName="active-link">
              Zoos
            </NavLink>
          </li>
        </ul>

        <Switch>
          <Route exact path="/">
            <div>
              <form onSubmit={formHandler}>
                <input type="file" className="input" multiple />
                <button type="submit">Upload</button>
              </form>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
              <h2>Uploading: {progress}%</h2>
              {downloadURLs.length > 0 && (
                <div>
                  <h3>Uploaded Pictures:</h3>
                  <div className="image-gallery">
                    {downloadURLs.map((url, index) => (
                      <img key={index} src={url} alt={`Uploaded ${index}`} className="uploaded-image" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Route>
          <Route path="/about" component={AboutPage} />
          <Route path="/monkey-types">
            <h1>Monkey Types</h1>
            <ul className="monkey-list">
              <li>
                <h2>Spider Monkey</h2>
                <p>
                  The spider monkey is known for its long limbs and tail, which allow it to move quickly and skillfully through the trees of the rainforest.
                </p>
              </li>
              <li>
                <h2>Howler Monkey</h2>
                <p>
                  The howler monkey is recognized by its loud and distinctive howls, which can be heard echoing through the jungle. It has a prehensile tail used for grasping branches.
                </p>
              </li>
              <li>
                <h2>Capuchin Monkey</h2>
                <p>
                  Capuchin monkeys are highly intelligent and known for their tool usage. They are often seen using rocks or sticks to crack open nuts or extract insects from tree bark.
                </p>
              </li>
            </ul>
          </Route>
          <Route path="/monkey-parks">
            <h1>Monkey Parks</h1>
            <ul className="monkey-parks-list">
              <li>
                <h2>Amazon Rainforest</h2>
                <p>
                  The Amazon Rainforest is home to a diverse range of monkey species, including the Spider Monkey, Squirrel Monkey, and Tamarin. Explore the vast expanse of the rainforest to witness these fascinating creatures in their natural habitat.
                </p>
              </li>
              <li>
                <h2>Monkey Forest Ubud, Bali</h2>
                <p>
                  Located in Ubud, Bali, the Monkey Forest is a sanctuary and nature reserve inhabited by the Balinese long-tailed monkeys. Take a stroll through the forest, observe their playful antics, and enjoy the serene surroundings.
                </p>
              </li>
              <li>
                <h2>Manuel Antonio National Park, Costa Rica</h2>
                <p>
                  Manuel Antonio National Park in Costa Rica is renowned for its abundant wildlife, including several monkey species like the Howler Monkey and White-faced Capuchin. Explore the park's trails and beaches to spot these charismatic primates.
                </p>
              </li>
            </ul>
          </Route>
          <Route path="/zoos">
            <h1>Zoos to See Monkeys</h1>
            <ul className="zoos-list">
              <li>
                <h2>San Diego Zoo, California</h2>
                <p>
                  The San Diego Zoo is home to a wide variety of monkey species from around the world. Explore the zoo's exhibits and witness the playful behavior and natural habitats of monkeys.
                </p>
              </li>
              <li>
                <h2>Taronga Zoo, Sydney</h2>
                <p>
                  Located in Sydney, Australia, Taronga Zoo features several monkey exhibits, including lemurs, gibbons, and tamarins. Enjoy a day at the zoo and observe these fascinating primates up close.
                </p>
              </li>
              {/* Add more zoos here */}
            </ul>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
