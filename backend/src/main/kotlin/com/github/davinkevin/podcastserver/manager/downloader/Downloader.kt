package com.github.davinkevin.podcastserver.manager.downloader

import com.github.davinkevin.podcastserver.manager.ItemDownloadManager

interface Downloader : Runnable {

    val downloadingInformation: DownloadingInformation

    fun with(information: DownloadingInformation, itemDownloadManager: ItemDownloadManager)

    fun download(): DownloadingItem

    fun startDownload()
    fun pauseDownload()
    fun restartDownload() = this.startDownload()
    fun stopDownload()
    fun failDownload()
    fun finishDownload()

    fun compatibility(downloadingInformation: DownloadingInformation): Int
}
