export const logout = async () => {
  await fetch('/api/logout/', {
    method: 'POST',
  }).then((res) => {
    if (res.ok) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear()
        }
      } catch (error) {
        console.log(error)
        alert(error)
      }
      window.location.href = '/'
    } else {
      console.log(res)
    }
  })
}
