package com.github.davinkevin.podcastserver.manager.downloader

import com.github.davinkevin.podcastserver.entity.Status
import com.github.davinkevin.podcastserver.manager.ItemDownloadManager
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import java.net.URI
import java.util.*

/**
 * Created by kevin on 16/03/2016 for Podcast Server
 */
class NoOpDownloaderTest {

    private val item: DownloadingItem = DownloadingItem (
            id = UUID.randomUUID(),
            title = "Title",
            status = Status.NOT_DOWNLOADED,
            url = URI("http://a.fake.url/with/file.mp4?param=1"),
            numberOfFail = 0,
            progression = 0,
            podcast = DownloadingItem.Podcast(
                    id = UUID.randomUUID(),
                    title = "A Fake ffmpeg Podcast"
            ),
            cover = DownloadingItem.Cover(
                    id = UUID.randomUUID(),
                    url = URI("https://bar/foo/cover.jpg")
            )
    )

    @Test
    fun `should return default value`() {
        /* Given */
        val info = DownloadingInformation(item,  listOf(), "noop.mp4", null)
        val downloader = NoOpDownloader().apply {
            with(info, mock())
        }

        /* When */
        downloader.pauseDownload()
        downloader.restartDownload()
        downloader.stopDownload()
        downloader.finishDownload()

        /* Then */
        assertThat(downloader.download()).isEqualTo(info.item)
        assertThat(downloader.compatibility(info)).isEqualTo(-1)
    }

    @Test
    fun `should remove itself from idm when start`() {
        /* GIVEN */
        val idm = mock<ItemDownloadManager>()
        val info = DownloadingInformation(item,  listOf(), "", "")
        val noOpDownloader = NoOpDownloader().apply {
                with(info, idm)
        }

        /* WHEN  */
        noOpDownloader.run()

        /* THEN  */
        verify(idm, times(1)).removeACurrentDownload(any())
    }
}
