function warn (message) {
  pre:
    typeof message === 'string';
  main:
    alert('Warning!\n' + message);
}