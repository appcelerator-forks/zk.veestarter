(ns vs.main
  (:require [vee.ti :as ti]
            [vee.reload :as reload]))

(ti/enable-console-print!)

(ti/update! js/Ti.App {:background-color "white"})

(defn start-app []
  (ti/open
    (ti/win {:background-color "white"}
      (ti/view {}
        (ti/image-view {:image "down.png"
                        :top 75}))
      (ti/view {:bottom 0
                :height 75
                :border-color "black"}
        (ti/image-view {})
        (ti/view {:bottom 0
                  :top 30
                  :background-color "#00BCD4"})))))

(defn stop-app [win]
  (when win
    (ti/close win)))

;; Live Reload

(reload/start
  {:base-url "http://localhost:8083" #_ "http://192.168.1.67:8083"
   :start-app start-app
   :stop-app stop-app})
