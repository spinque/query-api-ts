import { getSnippet } from '../../src/snippet';

const TEXT = `
Utrecht (uitspraakⓘ; Stad-Utrechts: Utreg of Utereg) is een stad en gemeente in Nederland en de hoofdstad van de provincie met dezelfde naam. Met 374.238 inwoners op 22 november 2024 is Utrecht qua inwonertal de vierde gemeente van Nederland. Deze inwoners zijn verdeeld over vier woonplaatsen, te weten Utrecht met 316.770, Haarzuilens met 620, Vleuten met 28.385 en De Meern met 21.965 inwoners. De agglomeratie Utrecht telde per 1 januari 2019 712.700 inwoners. In 2021 was Utrecht de snelst groeiende stad van Nederland.[3]

Utrecht is een van de oudste steden van Nederland. Het is ontstaan als een Romeinse fortificatie aan de Limes. In de zevende eeuw werd op de plaats waar dit fort zich bevond een kerkje gebouwd en in de eeuwen erna verrezen hier grotere kerken. In 1122 kreeg Utrecht als een van de eerste steden in het huidige Nederland stadsrechten. Dankzij zijn ligging aan de rivier de Rijn groeide Utrecht in de 13e en 14e eeuw uit tot belangrijke handelsstad in Europa. Met de opkomst van het graafschap Holland verplaatste deze handel zich daarheen en werd Utrecht minder belangrijk, hoewel Utrecht tot in het begin van de 16e eeuw de grootste stad van de Noordelijke Nederlanden bleef. In het jaar 1808 was Utrecht kortstondig de hoofdstad van het Koninkrijk Holland. Ten tijde van de industriële revolutie was Utrecht het centrum van de nationale staal- en spoorwegindustrie.

Utrecht heeft omstreeks 2020 de tweede economie in de noordvleugel van de Randstad, na Amsterdam. De regio Utrecht behoort tot de meest concurrerende economische regio’s in Europa.[4] De stad is het wegen- en spoorwegknooppunt van Nederland. Met een doorvoer van meer dan 57 miljoen reizigers per jaar is Utrecht Centraal het grootste station van Nederland. Mede hierom hebben veel bedrijven en instanties er hun hoofdvestiging, waaronder Bol., de Nederlandse Spoorwegen, Prorail, de Jaarbeurs en banken als de Rabobank en De Volksbank.

Utrecht huisvest naast de Universiteit Utrecht nog de Hogeschool Utrecht, de Universiteit voor Humanistiek, het Universitair Medisch Centrum Utrecht en de Hogeschool voor de Kunsten Utrecht. In totaal zijn er ongeveer 67.000 studenten, waarvan er ruim 33.000 woonachtig zijn in de stad.[5] Utrecht staat daarom bekend als een studentenstad.

Utrecht is de hoofdzetel van de Katholieke Kerk in Nederland en van het Aartsbisdom Utrecht. De Domtoren is met 112,32 meter de hoogste kerktoren van Nederland en het symbool van de stad. Utrecht heeft tevens een rijke kunsttraditie, waarvan de bekendste exponenten de schilders van de Utrechtse School zijn (onder anderen Jan van Scorel en Roelant Savery), en 20e-eeuwse kunstenaars als Gerrit Rietveld, Theo van Doesburg en Dick Bruna.
`;

const snippet = getSnippet(TEXT, 'studenten in Utrecht', { stopwords: 'dutch', stemmer: 'dutch', highlight: true });
console.log(snippet);
