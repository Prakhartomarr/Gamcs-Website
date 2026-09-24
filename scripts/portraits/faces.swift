import Foundation
import Vision
import AppKit

// Prints: path<TAB>imgW,imgH<TAB>faceX,faceY,faceW,faceH (pixels, origin top-left) per detected face.
for path in CommandLine.arguments.dropFirst() {
    guard let img = NSImage(contentsOfFile: path),
          let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("\(path)\tERROR load"); continue
    }
    let w = CGFloat(cg.width), h = CGFloat(cg.height)
    let req = VNDetectFaceRectanglesRequest()
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    do { try handler.perform([req]) } catch { print("\(path)\tERROR \(error)"); continue }
    let faces = (req.results ?? [])
    if faces.isEmpty { print("\(path)\t\(Int(w)),\(Int(h))\tNONE"); continue }
    for f in faces {
        let b = f.boundingBox // normalized, origin bottom-left
        let x = b.origin.x * w, fw = b.size.width * w, fh = b.size.height * h
        let y = (1 - b.origin.y - b.size.height) * h
        print("\(path)\t\(Int(w)),\(Int(h))\t\(Int(x)),\(Int(y)),\(Int(fw)),\(Int(fh))")
    }
}
