const isVideoPage = [
  'https://www.bilibili.com/video/',
  'https://www.bilibili.com/bangumi/',
].some(it => document.URL.startsWith(it))

// bangumi不需要转换URL
if (settings.preferAvUrl && document.URL.startsWith('https://www.bilibili.com/video/')) {
  SpinQuery.select(() => unsafeWindow.aid).then(aid => {
    if (!aid) {
      return
    }
    const newUrl = document.URL.replace(/\/(video|bangumi)\/(BV[\w]+)/i, (_, type) => {
      return `/${type}/av${aid}`
    })
    if (document.URL !== newUrl) {
      history.replaceState({}, document.title, newUrl)
    }
  })
}
export default {
  widget: {
    content: /*html*/`<div class="bvid-convert"></div>`,
    condition: async () => {
      if (isVideoPage) {
        return Boolean(await SpinQuery.select(() => unsafeWindow.aid || unsafeWindow.bvid))
      } else {
        return false
      }
    },
    success: () => {
      resources.applyStyle('bvidConvertStyle')
      const updateID = async () => {
        const label = dq('.bvid-convert') as HTMLDivElement
        const bvid = await (async () => {
          if (unsafeWindow.bvid) {
            return unsafeWindow.bvid
          }
          const link = await SpinQuery.select('.av-link,.bv-link,.bvid-link') as HTMLElement
          return link ? link.innerHTML : '未找到BV号'
        })()
        label.innerHTML = /*html*/`
          <div class="bvid-convert-item">av${unsafeWindow.aid}</div>
          <div class="bvid-convert-item">${bvid}</div>
        `
      }
      if (document.URL.startsWith('https://www.bilibili.com/bangumi/')) {
        Observer.videoChange(updateID)
      } else {
        updateID()
      }
    }
  }
}