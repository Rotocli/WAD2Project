import Swal from 'sweetalert2'

export function alertSuccess(message) {
  Swal.fire({
   
    icon: 'success',
    title: 'Success',
    text: message,
    timer: 2000,
    showConfirmButton: false,
    
  })

}

export function alertError(message) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  })
}

export function alertInfo(message) {
  Swal.fire({
    icon: 'info',
    title: 'Info',
    text: message,
    timer: 2000,
    showConfirmButton: false,
  })
}
export function promptSwal(message) {
  return Swal.fire({
    title: message || 'Continue?',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then(result => result.isConfirmed);
}