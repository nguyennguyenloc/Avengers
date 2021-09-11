const timeElapsed = Date.now();
const today = new Date(timeElapsed);
function Comment(namecomment, contentcomment) {
    // this.DateNow = moment(Date.now()).format('YYYY/MM/D hh:mm:ss SSS');
    this.DateNow = today.toDateString();
    this.NameComment = namecomment;
    this.ContentComment = contentcomment;
}